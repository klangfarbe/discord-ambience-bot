import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";

const commandsData = Object.values(commands).map((command) => command.data);
const rest = new REST().setToken(config.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), {
      body: commandsData,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

// type DeployCommandsProps = {
//   guildId: string;
// };

// export async function deployCommands({ guildId }: DeployCommandsProps) {
//   try {
//     console.log("Started refreshing application (/) commands.");

//     await rest.put(
//       Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId),
//       {
//         body: commandsData,
//       }
//     );

//     console.log("Successfully reloaded application (/) commands.");
//   } catch (error) {
//     console.error(error);
//   }
// }
