"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Channel {
  id: string;
  name: string;
  type: number;
}

export interface Role {
  id: string;
  name: string;
  color: number;
  position: number;
  hoist: boolean;
  permissions: string;
  managed: boolean;
}

interface Guild {
  id: string;
  name: string;
  channels: Channel[];
  roles: Role[];
}

interface GuildContextType {
  selectedGuild: string;
  setSelectedGuild: (id: string) => void;
  channels: Channel[];
  roles: Role[];
  guilds: Guild[];
  setGuilds: (guilds: Guild[]) => void;
  currentGuild: Guild | undefined;
  /** The Discord login expired and could not be refreshed. */
  needsReauth: boolean;
  setNeedsReauth: (value: boolean) => void;
}

const GuildContext = createContext<GuildContextType | undefined>(undefined);

export function GuildProvider({ children }: { children: ReactNode }) {
  const [selectedGuild, setSelectedGuild] = useState<string>("");
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [needsReauth, setNeedsReauth] = useState<boolean>(false);

  // Load all guilds
  useEffect(() => {
    const fetchUserGuilds = async () => {
      try {
        const res = await fetch("/api/discord/guilds");
        const data = await res.json();

        if (!res.ok) {
          setNeedsReauth(data?.reauth === true);
          setGuilds([]);
          return;
        }

        const fetchedGuilds = data.guilds || [];
        setNeedsReauth(false);
        setGuilds(fetchedGuilds);
      } catch (err) {
        console.error(err);
        setGuilds([]);
      }
    };

    void fetchUserGuilds();
  }, []);

  // Compute currently active guild
  const currentGuild = guilds.find((g) => g.id === selectedGuild);

  // Update channels + roles
  useEffect(() => {
    setChannels(currentGuild?.channels || []);
    setRoles(currentGuild?.roles || []);
  }, [currentGuild]);

  return (
    <GuildContext.Provider
      value={{
        selectedGuild,
        setSelectedGuild,
        channels,
        roles,
        guilds,
        setGuilds,
        currentGuild,
        needsReauth,
        setNeedsReauth,
      }}
    >
      {children}
    </GuildContext.Provider>
  );
}

export function useGuild() {
  const context = useContext(GuildContext);
  if (!context) throw new Error("useGuild must be used within a GuildProvider");
  return context;
}
