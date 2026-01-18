const sortLevelRolesByName = (levelRoleIds: string[], allRoles: { id: string; name: string }[]) => {
  return [...levelRoleIds]
    .map(id => allRoles.find(r => r.id === id)) // map naar role object
    .filter(Boolean) // verwijder eventueel niet gevonden roles
    .sort((a, b) => (a!.name > b!.name ? 1 : -1)) // sorteer op naam
    .map(r => r!.id); // terug naar IDs
};


