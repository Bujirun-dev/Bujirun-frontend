import type { StaticImageData } from "next/image";

import place1Image from "@/assets/place/place1.png";
import place2Image from "@/assets/place/place2.png";
import place3Image from "@/assets/place/place3.png";
import place4Image from "@/assets/place/place4.png";
import place5Image from "@/assets/place/place5.png";
import place6Image from "@/assets/place/place6.png";
import place7Image from "@/assets/place/place7.png";
import receiptProfileImage from "@/assets/receipt/receipt_profile.png";

export type ReceiptPlace = {
  id: number;
  time: string;
  name: string;
  category: string;
  categoryIcon: string;
  image: StaticImageData;
};

export type ReceiptDay = {
  day: number;
  date: string;
  weekday: string;
  places: ReceiptPlace[];
};

export type TripReceipt = {
  tripId: number;
  traveler: string;
  title: string;
  profileImage: StaticImageData;
  period: {
    startDate: string;
    endDate: string;
  };
  companion: string;
  mood: string;
  theme: string;
  collection: number;
  barcode: string;
  days: ReceiptDay[];
};

export const tripReceipts: TripReceipt[] = [
  {
    tripId: 1,
    traveler: "유리",
    title: "부지렁즈",
    profileImage: receiptProfileImage,
    period: {
      startDate: "2026-07-15",
      endDate: "2026-07-18",
    },
    companion: "은지. 유정. 성빈. 제승",
    mood: "😇",
    theme: "바다. 힐링",
    collection: 15,
    barcode: "20260715-0718-BUSAN",
    days: [
      {
        day: 1,
        date: "07.15",
        weekday: "수",
        places: [
          {
            id: 1,
            time: "13:30",
            name: "해운대해수욕장",
            category: "바다",
            categoryIcon: "🌊",
            image: place1Image,
          },
          {
            id: 2,
            time: "18:20",
            name: "동백섬",
            category: "자연",
            categoryIcon: "🌿",
            image: place2Image,
          },
        ],
      },
      {
        day: 2,
        date: "07.16",
        weekday: "목",
        places: [
          {
            id: 3,
            time: "10:20",
            name: "광안리",
            category: "바다",
            categoryIcon: "🌊",
            image: place3Image,
          },
          {
            id: 4,
            time: "13:10",
            name: "감천문화마을",
            category: "문화",
            categoryIcon: "🏛️",
            image: place4Image,
          },
          {
            id: 5,
            time: "16:30",
            name: "흰여울문화마을",
            category: "문화",
            categoryIcon: "🏛️",
            image: place5Image,
          },
          {
            id: 6,
            time: "20:00",
            name: "광안대교",
            category: "바다",
            categoryIcon: "🌊",
            image: place6Image,
          },
        ],
      },
      {
        day: 3,
        date: "07.17",
        weekday: "금",
        places: [
          {
            id: 7,
            time: "11:00",
            name: "송도해상케이블카",
            category: "체험",
            categoryIcon: "🎡",
            image: place7Image,
          },
        ],
      },
    ],
  },
  {
    tripId: 2,
    traveler: "유리",
    title: "부지렁즈",
    profileImage: receiptProfileImage,
    period: {
      startDate: "2026-07-15",
      endDate: "2026-07-18",
    },
    companion: "은지. 유정. 성빈. 제승",
    mood: "😇",
    theme: "바다. 힐링",
    collection: 15,
    barcode: "20260715-0718-BUSAN",
    days: [
      {
        day: 1,
        date: "07.15",
        weekday: "수",
        places: [
          {
            id: 1,
            time: "13:30",
            name: "해운대해수욕장",
            category: "바다",
            categoryIcon: "🌊",
            image: place1Image,
          },
          {
            id: 2,
            time: "18:20",
            name: "동백섬",
            category: "자연",
            categoryIcon: "🌿",
            image: place2Image,
          },
        ],
      },
      {
        day: 2,
        date: "07.16",
        weekday: "목",
        places: [
          {
            id: 3,
            time: "10:20",
            name: "광안리",
            category: "바다",
            categoryIcon: "🌊",
            image: place3Image,
          },
          {
            id: 4,
            time: "13:10",
            name: "감천문화마을",
            category: "문화",
            categoryIcon: "🏛️",
            image: place4Image,
          },
          {
            id: 5,
            time: "16:30",
            name: "흰여울문화마을",
            category: "문화",
            categoryIcon: "🏛️",
            image: place5Image,
          },
          {
            id: 6,
            time: "20:00",
            name: "광안대교",
            category: "바다",
            categoryIcon: "🌊",
            image: place6Image,
          },
        ],
      },
      {
        day: 3,
        date: "07.17",
        weekday: "금",
        places: [
          {
            id: 7,
            time: "11:00",
            name: "송도해상케이블카",
            category: "체험",
            categoryIcon: "🎡",
            image: place7Image,
          },
        ],
      },
    ],
  },
  {
    tripId: 3,
    traveler: "유리",
    title: "부지렁즈",
    profileImage: receiptProfileImage,
    period: {
      startDate: "2026-07-15",
      endDate: "2026-07-18",
    },
    companion: "은지. 유정. 성빈. 제승",
    mood: "😇",
    theme: "바다. 힐링",
    collection: 15,
    barcode: "20260715-0718-BUSAN",
    days: [
      {
        day: 1,
        date: "07.15",
        weekday: "수",
        places: [
          {
            id: 1,
            time: "13:30",
            name: "해운대해수욕장",
            category: "바다",
            categoryIcon: "🌊",
            image: place1Image,
          },
          {
            id: 2,
            time: "18:20",
            name: "동백섬",
            category: "자연",
            categoryIcon: "🌿",
            image: place2Image,
          },
        ],
      },
      {
        day: 2,
        date: "07.16",
        weekday: "목",
        places: [
          {
            id: 3,
            time: "10:20",
            name: "광안리",
            category: "바다",
            categoryIcon: "🌊",
            image: place3Image,
          },
          {
            id: 4,
            time: "13:10",
            name: "감천문화마을",
            category: "문화",
            categoryIcon: "🏛️",
            image: place4Image,
          },
          {
            id: 5,
            time: "16:30",
            name: "흰여울문화마을",
            category: "문화",
            categoryIcon: "🏛️",
            image: place5Image,
          },
          {
            id: 6,
            time: "20:00",
            name: "광안대교",
            category: "바다",
            categoryIcon: "🌊",
            image: place6Image,
          },
        ],
      },
      {
        day: 3,
        date: "07.17",
        weekday: "금",
        places: [
          {
            id: 7,
            time: "11:00",
            name: "송도해상케이블카",
            category: "체험",
            categoryIcon: "🎡",
            image: place7Image,
          },
        ],
      },
    ],
  },
  {
    tripId: 4,
    traveler: "유리",
    title: "부지렁즈",
    profileImage: receiptProfileImage,
    period: {
      startDate: "2026-07-15",
      endDate: "2026-07-18",
    },
    companion: "은지. 유정. 성빈. 제승",
    mood: "😇",
    theme: "바다. 힐링",
    collection: 15,
    barcode: "20260715-0718-BUSAN",
    days: [
      {
        day: 1,
        date: "07.15",
        weekday: "수",
        places: [
          {
            id: 1,
            time: "13:30",
            name: "해운대해수욕장",
            category: "바다",
            categoryIcon: "🌊",
            image: place1Image,
          },
          {
            id: 2,
            time: "18:20",
            name: "동백섬",
            category: "자연",
            categoryIcon: "🌿",
            image: place2Image,
          },
        ],
      },
      {
        day: 2,
        date: "07.16",
        weekday: "목",
        places: [
          {
            id: 3,
            time: "10:20",
            name: "광안리",
            category: "바다",
            categoryIcon: "🌊",
            image: place3Image,
          },
          {
            id: 4,
            time: "13:10",
            name: "감천문화마을",
            category: "문화",
            categoryIcon: "🏛️",
            image: place4Image,
          },
          {
            id: 5,
            time: "16:30",
            name: "흰여울문화마을",
            category: "문화",
            categoryIcon: "🏛️",
            image: place5Image,
          },
          {
            id: 6,
            time: "20:00",
            name: "광안대교",
            category: "바다",
            categoryIcon: "🌊",
            image: place6Image,
          },
        ],
      },
      {
        day: 3,
        date: "07.17",
        weekday: "금",
        places: [
          {
            id: 7,
            time: "11:00",
            name: "송도해상케이블카",
            category: "체험",
            categoryIcon: "🎡",
            image: place7Image,
          },
        ],
      },
    ],
  },
];
