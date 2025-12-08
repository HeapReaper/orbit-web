import { ReviewsType } from "@/app/types/reviews";
import Image from "next/image";
import React from "react";

async function getReviews() {
  const res = await fetch(`${process.env.DIRECTUS_URL}/items/Review`, {
    next: { revalidate: 30 },
  });

  const data = await res.json();
  return data.data;
}

export default async function ReviewsSection() {
  const reviews: ReviewsType[] = await getReviews();

  console.log(reviews);
  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-12 text-center">
        What our users say
      </h2>

      <div className="flex flex-wrap justify-center gap-8">
        {reviews.map((review: ReviewsType, index: number) => (
          <div
            className="bg-[#14171f] p-6 rounded-lg hover:shadow-lg hover:border-blue-600 border border-gray-900 transition w-80"
            key={index}
          >
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={
                  review.avatar
                    ? `${process.env.DIRECTUS_URL}/assets/${review.avatar}`
                    : "/team/default-profile-picture.png"
                }
                alt="User avatar"
                width={50}
                height={50}
                className="rounded-full border border-[var(--primary-color)] h-13 w-13"
              />
              <div>
                <h4 className="font-semibold">{review.name}</h4>
                <p className="text-gray-400 text-sm">{review.title}</p>
              </div>
            </div>

            {/* Scrollable review text */}
            <p className="text-gray-300 max-h-24 overflow-y-auto">
              "{review.review}"
            </p>

            <div className="flex text-yellow-400 mt-4">
              {review.stars}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}