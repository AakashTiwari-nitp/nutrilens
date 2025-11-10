import Image from 'next/image'
import React, { useContext } from 'react'
import { useRouter } from 'next/navigation';
import { ThemeContext } from '@/context/ThemeContext';

const ProductCard = ({ item }) => {
    const { theme } = useContext(ThemeContext);
    const router = useRouter();

    return (
        <div
            key={item._id}
            className={`${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            } rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300`}
        >
            <div className="relative h-48 w-full">
                <Image
                    src={item.productImage}
                    alt={item.name}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="p-4">
                <h3 className={`text-lg font-semibold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  {item.name}
                </h3>

                <p className={`mb-2 max-h-15 min-h-15 p-1/2 overflow-y-auto ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}>
                  {item.description}
                </p>

                <div className="mt-2 space-y-2">
                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {item.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className={`${
                                      theme === "dark"
                                        ? "bg-gray-700 text-gray-200"
                                        : "bg-blue-100 text-black"
                                    } text-xs px-2 py-1 rounded-full transition-colors duration-300`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div>
                        <span className={`text-lg font-bold ${
                          theme === "dark" ? "text-white" : "text-black"
                        }`}>
                          ₹{item.price}
                        </span>
                        {item.publicRating > 0 && (
                          <div className="text-sm text-yellow-500">
                            Rating: {item.publicRating}⭐
                          </div>
                        )}
                    </div>
                    <button
                        onClick={() => router.push(`/product/${item.productId}`)}
                        className={`${
                          theme === "dark"
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-black hover:bg-gray-800"
                        } text-white px-4 py-2 rounded-lg transition-colors duration-300`}
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard