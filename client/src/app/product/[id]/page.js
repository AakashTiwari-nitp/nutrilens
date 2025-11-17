"use client";
import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { AuthContext } from '@/context/AuthContext';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AiFillStar } from 'react-icons/ai';

export default function ProductDetailsPage() {
  const { theme } = useContext(ThemeContext);
  const pathname = usePathname();
  const router = useRouter();
  const productId = pathname.split("/").pop();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useContext(AuthContext);

  // Rating states
  const [publicRating, setPublicRating] = useState({ averageRating: 0, numberOfRatings: 0 });
  const [userRating, setUserRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const bg = theme === "dark" ? "bg-gray-900" : "bg-gray-100";
  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const subText = theme === "dark" ? "text-gray-300" : "text-gray-600";

  // Helper function to format nutritional info keys
  const formatNutritionKey = (key) => {
    // Extract unit suffix
    let unit = '';
    let label = key;

    if (key.endsWith('_g')) {
      unit = ' (g)';
      label = key.slice(0, -2);
    } else if (key.endsWith('_mg')) {
      unit = ' (mg)';
      label = key.slice(0, -3);
    }

    // Replace underscores with spaces and capitalize each word
    label = label
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return label + unit;
  };

  // Single star that supports fractional fill (fill: 0..1)
  const Star = ({ fill = 0, sizeClass = 'text-2xl', className = '' }) => {
    const pct = Math.max(0, Math.min(1, Number(fill))) * 100;
    return (
      <span className={`relative inline-block align-middle ${className}`}>
        <span className={`text-gray-300 dark:text-gray-600 ${sizeClass}`}>
          <AiFillStar />
        </span>
        <span className="absolute top-0 left-0 overflow-hidden" style={{ width: `${pct}%`, height: '100%' }}>
          <span className={`text-yellow-400 ${sizeClass}`}>
            <AiFillStar />
          </span>
        </span>
      </span>
    );
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${baseUrl}/product/${productId}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.data.product);
          // fetch public rating after product is loaded
          fetchPublicRating();
          // fetch recommendations for this product
          fetchRecommendations();
          // generate QR code for this product page (client-side only)
          generateQrCode();
        } else {
          setError(data.message || "Failed to fetch product details");
        }
      } catch (error) {
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Generate QR code for current product URL using 'qrcode' package dynamically
  const generateQrCode = async () => {
    try {
      // build absolute URL for this product page
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const url = `${origin}/product/${productId}`;

      // dynamic import to avoid bundling on server
      const QRCode = await import('qrcode');
      const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
      setQrDataUrl(dataUrl);
    } catch (err) {
      // library may be missing in dev — log and continue
      console.error('Failed to generate QR code (install `qrcode`):', err);
      setQrDataUrl(null);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const resp = await fetch(`${baseUrl}/product/${productId}/recommendations`, {
        method: 'GET',
      });
      if (!resp.ok) return;
      const json = await resp.json();
      if (json.success) {
        setRecommendations(json.data.recommendations || []);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    }
  };

  // Fetch public rating and current user's rating (if any)
  const fetchPublicRating = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const resp = await fetch(`${baseUrl}/product/${productId}/public-rating`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!resp.ok) return;
      const json = await resp.json();
      if (json.success) {
        setPublicRating(json.data.publicRating || { averageRating: 0, numberOfRatings: 0 });
        if (typeof json.data.userRating !== 'undefined' && json.data.userRating !== null) {
          setUserRating(Number(json.data.userRating));
        }
      }
      // console.log('Fetched public rating', json);
    } catch (err) {
      console.error('Failed to fetch public rating', err);
    }
  };

  // Submit or update rating
  const handleRate = async (ratingValue) => {
    if (!isAuthenticated) {
      // Could navigate to login; for now show a message
      setRatingError('Please login to submit a rating');
      return;
    }

    setRatingLoading(true);
    setRatingError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const resp = await fetch(`${baseUrl}/product/${productId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: ratingValue }),
      });

      const json = await resp.json();
      if (!resp.ok) {
        setRatingError(json.message || 'Failed to submit rating');
      } else {
        // Update UI from response
        if (json.data?.publicRating) setPublicRating(json.data.publicRating);
        if (typeof json.data?.userRating !== 'undefined') setUserRating(Number(json.data.userRating));
      }
    } catch (err) {
      console.error('Rate submit error', err);
      setRatingError('Failed to submit rating');
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} py-12 px-4 sm:px-6 lg:px-8 md:ml-48 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className={`${cardBg} rounded-xl shadow-lg overflow-hidden transition-colors duration-300`}>
          {/* Product Header */}
          <div className="p-8">
            <Link href={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-600 hover:underline dark:text-blue-300 mb-4 block">
              ← Back to {product.category}
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="relative h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden">
                <Image
                  src={product.productImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div>
                <h1 className={`text-3xl font-bold ${textColor} mb-4 transition-colors duration-300`}>
                  {product.name}
                </h1>
                <p className={`${subText} mb-4 transition-colors duration-300`}>
                  {product.description}
                </p>
                <div className="space-y-4">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">₹{product.price}</p>
                  <div className="flex gap-2">
                    {product.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div>
                    <p className={`text-sm ${subText} transition-colors duration-300`}>
                      Product ID: {product.productId}
                    </p>
                  </div>
                  {/* QR Code */}
                  <div className="mt-2 justify-center flex items-center gap-3">
                    {/* Inline small QR preview (normal view) */}
                    {qrDataUrl && (
                      <img src={qrDataUrl} alt="Product QR" className="w-30 lg:w-48 h-30 lg:h-48 rounded-md border" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nutritional Info */}
          {/* On small screens make this panel scrollable with a reasonable max height; on md+ allow natural height */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-8 max-h-96 md:max-h-none overflow-y-auto md:overflow-visible">
            <h2 className={`text-2xl font-bold mb-4 ${textColor} transition-colors duration-300`}>Nutritional Information</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center transition-colors duration-300 wrap-break-word">
                  <p className={`${subText} transition-colors duration-300`}>{formatNutritionKey(key)}</p>
                  <p className={`font-bold ${textColor} transition-colors duration-300`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-8">
            <h2 className={`text-2xl font-bold mb-4 ${textColor} transition-colors duration-300`}>Ingredients</h2>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ingredient, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full text-sm transition-colors duration-300">
                  {ingredient}
                </span>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className={`text-2xl font-bold mb-4 ${textColor} transition-colors duration-300`}>Product Details</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-semibold mr-2">Public Rating:</span>
                    <span className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
                      <span className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => {
                          const diff = Number(publicRating.averageRating) - (i - 1);
                          const fill = Math.max(0, Math.min(1, diff));
                          return <Star key={`pub-${i}`} fill={fill} sizeClass="text-base md:text-lg" />;
                        })}
                        <span className="ml-1">{publicRating.averageRating.toFixed(2)}</span>
                      </span>
                    </span>
                    <span className={`ml-2 text-sm ${subText}`}>({publicRating.numberOfRatings} ratings)</span>
                  </div>
                </div>

                {/* Star rating input (visible for all users) */}
                {
                  isAuthenticated && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-semibold mr-2">Your Rating:</span>
                      {[1, 2, 3, 4, 5].map((i) => {
                        // Determine per-star fractional fill. If userRating exists use it (may be fractional),
                        // otherwise use publicRating.averageRating.
                        const sourceRating = (typeof userRating === 'number') ? Number(userRating) : Number(publicRating.averageRating || 0);
                        const diff = sourceRating - (i - 1);
                        const fill = Math.max(0, Math.min(1, diff));

                        // click handler that supports fractional selection within a star (rounded to 0.5)
                        const onStarClick = (e) => {
                          // If not authenticated, redirect to login preserving return path
                          if (!isAuthenticated) {
                            router.push(`/auth/login?redirect=/product/${productId}`);
                            return;
                          }

                          // Determine click position to compute fractional value
                          const target = e.currentTarget;
                          const rect = target.getBoundingClientRect();
                          const clickX = e.clientX - rect.left; // px
                          const frac = Math.max(0, Math.min(1, clickX / rect.width));
                          let value = (i - 1) + frac; // 0..5
                          // Round to nearest 0.5
                          value = Math.round(value * 2) / 2;
                          // clamp between 1 and 5
                          value = Math.max(1, Math.min(5, value));
                          handleRate(value);
                        };

                        return (
                          <button
                            key={i}
                            aria-label={`Rate ${i} stars`}
                            onClick={onStarClick}
                            disabled={ratingLoading}
                            className="p-0 bg-transparent border-0"
                            title={isAuthenticated ? `Rate ${i} star(s)` : 'Login to submit a rating'}
                          >
                            <Star fill={fill} sizeClass="text-xl md:text-2xl" />
                          </button>
                        );
                      })}
                      {ratingLoading && <span className="text-sm ml-2">Submitting...</span>}
                    </div>
                  )
                }

                {ratingError && <div className="text-sm text-red-600 mt-1">{ratingError}</div>}
                {(!isAuthenticated) && <div className="text-sm text-gray-500 mt-1">Login to submit your rating.</div>}
              </div>

            </div>
            {/* Recommendations: products in same category with higher public rating */}
            <div className=" border-gray-200 dark:border-gray-700">
              <h2 className={`text-2xl font-bold mb-4 ${textColor} transition-colors duration-300`}>Recommended products</h2>
              {recommendations.length === 0 ? (
                <p className={`${subText}`}>No higher-rated products found in this category.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {recommendations.map((rec) => (
                    <Link key={rec._id} href={`/product/${rec.productId}`} className={`block p-4 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow`}>
                      <div className="relative h-40 w-full rounded-md overflow-hidden mb-3">
                        <Image src={rec.productImage} alt={rec.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`font-semibold text-wrap ${textColor} truncate`}>{rec.name}</h3>
                          <p className={`text-sm ${subText}`}>₹{rec.price}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => {
                            const diff = Number(rec.publicRating || 0) - (i - 1);
                            const fill = Math.max(0, Math.min(1, diff));
                            return <Star key={`r-${rec._id}-${i}`} fill={fill} sizeClass="text-base" />;
                          })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          {product.certifications.length > 0 && (
            <div>
              <h2 className={`text-2xl font-bold mb-4 ${textColor} transition-colors duration-300`}>Certifications</h2>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map((cert, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}
