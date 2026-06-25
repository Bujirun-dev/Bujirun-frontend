import profileHat from "@/assets/character/profile/profile-hat.png";
import profileHeart from "@/assets/character/profile/profile-heart.png";
import profileParty from "@/assets/character/profile/profile-party.png";
import profileSleepy from "@/assets/character/profile/profile-sleepy.png";
import profileSunglass from "@/assets/character/profile/profile-sunglass.png";
import profileV from "@/assets/character/profile/profile-v.png";

export const PROFILE_AVATARS = [
  profileHat,
  profileHeart,
  profileParty,
  profileSleepy,
  profileSunglass,
  profileV,
];

export type ProfileAvatar = (typeof PROFILE_AVATARS)[number];
