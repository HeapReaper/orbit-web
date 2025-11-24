import Image from "next/image";
import React from "react";
import { ourTeamData } from "@/app/(public)/data/ourTeam";

export default function OurTeamSection() {
  return (
    <section className="px-6 md:px-20 py-16">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Team</h2>

      <div className="flex flex-wrap justify-center gap-8">
        {/* Team member */}
        {ourTeamData.map((member, index) => (
          <div className="bg-[#14171f] p-6 rounded-lg hover:shadow-lg hover:border-blue-600 border border-gray-900 text-center transition w-60">
            <Image
              src={`/team/${member.profilePicture}`}
              alt={member.name}
              width={120}
              height={120}
              className="rounded-full mx-auto mb-4 border border-[var(--primary-color)]"
            />
            <h3 className="text-xl font-semibold text-white">
              {member.name}
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              {member.title}
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <a href={member.linkUrl} target="_blank" rel="author" className="underline decoration-[var(--primary-color)]">
                {member.linkTitle}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}