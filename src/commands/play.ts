import { QueueRepeatMode, useMainPlayer, useQueue } from "discord-player";
import {
  ChannelType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  VoiceChannel,
} from "discord.js";
import { buttons } from "../buttons";

export const data = new SlashCommandBuilder()
  .setName(`play`)
  .setDescription("play looped audio from url")
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("The voice channel")
      .addChannelTypes(ChannelType.GuildVoice)
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("url").setRequired(true).setDescription("audio file url")
  )
  .addIntegerOption((option) =>
    option
      .setName("volume")
      .setMinValue(0)
      .setMaxValue(100)
      .setDescription("audio volume")
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel("channel");
  const url = interaction.options.getString("url");
  const volume = interaction.options.getInteger("volume") ?? 10;

  if (!channel || channel.type != ChannelType.GuildVoice)
    return interaction.reply(`invalid channel`);

  if (!url) return interaction.reply(`invalid url`);

  const player = useMainPlayer();
  let queue = useQueue();

  await interaction.deferReply();

  if (!queue) {
    queue = player.nodes.create(interaction.guild!);
    queue.options.pauseOnEmpty = true;
    queue.options.leaveOnEmpty = false;
    queue.options.leaveOnStop = false;
    queue.setRepeatMode(QueueRepeatMode.TRACK);
  }

  const result = await player.search(url);

  if (!result) return interaction.followUp(`invalid url`);

  await queue.connect(channel as VoiceChannel);

  // acquire task entry
  const entry = queue.tasksQueue.acquire();

  // wait for previous task to be released and our task to be resolved
  await entry.getTask();

  try {
    // add track(s) (this will add playlist or single track from the result)
    if (!queue.isEmpty()) {
      queue.removeTrack(0);
      queue.clear();
    }

    queue.addTrack(result.tracks);

    if (!queue.isPlaying()) await queue.node.play();

    queue.node.setVolume(volume);
  } finally {
    // release the task we acquired to let other tasks to be executed
    // make sure you are releasing your entry, otherwise your bot won't
    // accept new play requests
    queue.tasksQueue.release();
  }

  // ---------------------------------------------------------------------------
  // Buttons
  // ---------------------------------------------------------------------------

  return interaction.followUp({
    content: `**Playing:** ${queue.currentTrack?.title} - ${queue.currentTrack?.author}`,
    components: buttons,
  });

  // const currentTrack = queue.currentTrack;
  // // const upcomingTracks = queue.tracks.toArray().slice(0, 5);

  // // Create a message with the current track and upcoming tracks
  // const message = [
  //   `**Playing:** ${currentTrack?.title} - ${currentTrack?.author}`,
  //   // "",
  //   // "**Upcoming Tracks:**",
  //   // ...upcomingTracks.map(
  //   //   (track, index) => `${index + 1}. ${track.title} - ${track.author}`
  //   // ),
  // ].join("\n");
  // return interaction.followUp(message);
  // // }
}
