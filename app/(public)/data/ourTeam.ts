type OurTeam = {
  name: string;
  title: string;
  linkTitle?: string;
  linkUrl?: string;
  profilePicture: string;
}

export const ourTeamData: OurTeam[] = [
  {
    name: "Kelvin de Reus",
    title: "Owner & Developer",
    linkTitle: "Portfolio",
    linkUrl: "https://heapreaper.nl",
    profilePicture: "kelvin-de-reus.webp"
  },
  {
    name: "Sander den Breejen",
    title: "Application Tester",
    linkTitle: "Community",
    linkUrl: "https://alldaytechandgaming.nl",
    profilePicture: "default-profile-picture.png"
  },
];