import Image from 'next/image'
import React from 'react'
import { useRouter } from 'next/navigation';

const ProductCard = ({ item }) => {
    const router = useRouter();

    return (
        <div
            key={item._id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
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
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>

                <p className="text-gray-600 mb-2 max-h-15 min-h-15 p-1/2 overflow-y-auto">{item.description}</p>

                <div className="mt-2 space-y-2">
                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {item.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-black text-xs px-2 py-1 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div>
                        <span className="text-lg font-bold text-blue-600">
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
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard