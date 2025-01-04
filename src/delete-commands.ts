import { REST, Routes } from "discord.js";
import { config } from "./config";

const rest = new REST().setToken(config.DISCORD_TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), {
      body: [],
    });
  } catch (error) {
    console.error(error);
  }
})();
