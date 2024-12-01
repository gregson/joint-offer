import React from 'react';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  pros?: string[];
  cons?: string[];
}

interface UserReviewsProps {
  reviews: Review[];
}

const UserReviews: React.FC<UserReviewsProps> = ({ reviews }) => {
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h2 className="text-2xl font-bold">Avis clients</h2>
        <div className="mt-4 md:mt-0 text-center">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-6 h-6 ${
                  star <= averageRating ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-xl font-bold">
              {averageRating.toFixed(1)}
            </span>
            <span className="ml-2 text-gray-600">
              ({reviews.length} avis)
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold">{review.author}</p>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-gray-500 text-sm">{review.date}</span>
            </div>

            <p className="text-gray-700 mb-4">{review.comment}</p>

            {(review.pros || review.cons) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {review.pros && (
                  <div>
                    <p className="text-green-600 font-semibold mb-2">Points positifs</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {review.pros.map((pro, index) => (
                        <li key={index} className="text-gray-600">{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {review.cons && (
                  <div>
                    <p className="text-red-600 font-semibold mb-2">Points négatifs</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {review.cons.map((con, index) => (
                        <li key={index} className="text-gray-600">{con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserReviews;
