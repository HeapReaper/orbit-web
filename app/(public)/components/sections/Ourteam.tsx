import Image from "next/image";
import React from "react";

export default function OurTeamSection() {
  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Team</h2>

      <div className="flex flex-wrap justify-center gap-8">
        {/* Team member */}
        <div className="bg-[#14171f] p-6 rounded-lg hover:shadow-lg hover:border-blue-600 border border-gray-900 text-center transition w-60">
          <Image
            src="/team/john_doe.png"
            alt="John Doe"
            width={120}
            height={120}
            className="rounded-full mx-auto mb-4 border border-gray-700"
          />
          <h3 className="text-xl font-semibold text-white">John Doe</h3>
          <p className="text-gray-400 text-sm mb-2">Founder & CEO</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="https://twitter.com/johndoe" target="_blank" rel="noopener noreferrer">
              <Image src="/icons/twitter.svg" alt="Twitter" width={24} height={24} />
            </a>
            <a href="https://github.com/johndoe" target="_blank" rel="noopener noreferrer">
              <Image src="/icons/github.svg" alt="GitHub" width={24} height={24} />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}