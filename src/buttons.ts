import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

const stop = new ButtonBuilder()
  .setCustomId("stop")
  .setLabel("Stop")
  .setStyle(ButtonStyle.Danger);

const pause = new ButtonBuilder()
  .setCustomId("pause")
  .setLabel("Pause")
  .setStyle(ButtonStyle.Primary);

const play = new ButtonBuilder()
  .setCustomId("play")
  .setLabel("Play")
  .setStyle(ButtonStyle.Success);

const vols = [
  { id: "vol10", text: "Vol 10%" },
  { id: "vol25", text: "Vol 25%" },
  { id: "vol50", text: "Vol 50%" },
  { id: "vol75", text: "Vol 75%" },
  { id: "vol100", text: "Vol 100%" },
].map((i) =>
  new ButtonBuilder()
    .setCustomId(i.id)
    .setLabel(i.text)
    .setStyle(ButtonStyle.Secondary)
);

export const buttons = [
  new ActionRowBuilder().addComponents(play, pause, stop),
  new ActionRowBuilder().addComponents(...vols),
];
