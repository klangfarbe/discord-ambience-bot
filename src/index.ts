import { Client, Events, IntentsBitField, MessageFlags } from "discord.js";

import { commands } from "./commands";
import { config } from "./config";
import { Player, useMainPlayer } from "discord-player";
import { DefaultExtractors } from "@discord-player/extractor";

// -----------------------------------------------------------------------------
// Create a new client instance
// -----------------------------------------------------------------------------
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

client.login(config.DISCORD_TOKEN);

// Audio player
(async () => {
  const player = new Player(client);
  await player.extractors.loadMulti(DefaultExtractors);
})();

// -----------------------------------------------------------------------------
// eventhandling
// -----------------------------------------------------------------------------
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || !interaction.guild) return;

  try {
    const player = useMainPlayer();
    const cmd = commands[interaction.commandName as keyof typeof commands];

    if (cmd) {
      await player.context.provide(
        {
          guild: interaction.guild,
        },
        () => cmd.execute(interaction)
      );
    }
  } catch (error) {
    console.log(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

//   console.log(interaction);
//   if (!interaction.isChatInputCommand()) return;

//   const command = interaction.client.commands.get(interaction.commandName);
//   if (!command) return;

//   try {
//     const player = useMainPlayer();
//     const data = {
//       guild: interaction.guild,
//     };

//     await player.context.provide(data, () => command.execute(interaction));
//     // await command.execute(interaction);
//   } catch (error) {

//   }
// });
