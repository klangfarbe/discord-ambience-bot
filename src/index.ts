import { Client, Events, IntentsBitField, MessageFlags } from "discord.js";

import { commands } from "./commands";
import { config } from "./config";
import { Player, useMainPlayer, useQueue, useTimeline } from "discord-player";
import { DefaultExtractors } from "@discord-player/extractor";
import { buttons } from "./buttons";

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
  if (!interaction.guild) return;

  const player = useMainPlayer();

  if (interaction.isChatInputCommand()) {
    try {
      const cmd = commands[interaction.commandName as keyof typeof commands];

      if (cmd) {
        await player.context.provide({ guild: interaction.guild }, () =>
          cmd.execute(interaction)
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
  }

  if (interaction.isButton()) {
    const queue = useQueue(interaction.guild);

    let content = `**Playing:** ${queue?.currentTrack?.title} - ${queue?.currentTrack?.author}`;

    switch (interaction.customId) {
      case "stop": {
        queue?.delete();
        return interaction.reply("Player stopped");
      }

      case "play":
      case "pause": {
        const timeline = useTimeline({ node: interaction.guild });
        if (timeline) timeline.paused ? timeline.resume() : timeline.pause();
        break;
      }

      default:
        if (queue)
          queue.node.setVolume(parseInt(interaction.customId.slice(3)));
    }

    return interaction.reply({
      content,
      components: buttons,
    });
  }
});
