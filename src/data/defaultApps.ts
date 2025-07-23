import { App } from '@/types';

export const defaultApps: App[] = [
  {
    id: 1,
    name: 'Khan Academy',
    url: 'https://www.khanacademy.org/',
    icon: 'GraduationCap',
    color: 'bg-blue-500',
    timeLimit: 30,
    category: 'educational'
  },
  {
    id: 2,
    name: 'Scratch Programming',
    url: 'https://scratch.mit.edu/',
    icon: 'Code',
    color: 'bg-orange-500',
    timeLimit: 40,
    category: 'creative'
  },
  {
    id: 3,
    name: 'Cool Math Games',
    url: 'https://www.coolmath-games.com/',
    icon: 'Gamepad2',
    color: 'bg-green-500',
    timeLimit: 20,
    category: 'educational'
  },
  {
    id: 4,
    name: 'National Geographic Kids',
    url: 'https://kids.nationalgeographic.com/',
    icon: 'Globe',
    color: 'bg-yellow-500',
    timeLimit: 25,
    category: 'educational'
  },
  {
    id: 5,
    name: 'PBS Kids',
    url: 'https://pbskids.org/games',
    icon: 'Tv',
    color: 'bg-red-500',
    timeLimit: 20,
    category: 'entertainment'
  },
  {
    id: 6,
    name: 'Prodigy Math',
    url: 'https://www.prodigygame.com/',
    icon: 'Wand2',
    color: 'bg-purple-500',
    timeLimit: 30,
    category: 'educational'
  },
  {
    id: 7,
    name: 'Tinkercad',
    url: 'https://www.tinkercad.com/',
    icon: 'Box',
    color: 'bg-cyan-500',
    timeLimit: 35,
    category: 'creative'
  },
  {
    id: 8,
    name: 'Duolingo',
    url: 'https://www.duolingo.com/',
    icon: 'Languages',
    color: 'bg-green-600',
    timeLimit: 25,
    category: 'educational'
  }
];

export const availableIcons = [
  'GraduationCap', 'Code', 'Gamepad2', 'Globe', 'Tv', 'Wand2', 'Box', 'Languages',
  'BookOpen', 'Paintbrush', 'Music', 'Camera', 'Calculator', 'Atom', 'Telescope',
  'Microscope', 'Palette', 'Puzzle', 'Target', 'Trophy'
];

export const availableColors = {
  'Blue': 'bg-blue-500',
  'Green': 'bg-green-500',
  'Purple': 'bg-purple-500',
  'Red': 'bg-red-500',
  'Orange': 'bg-orange-500',
  'Yellow': 'bg-yellow-500',
  'Cyan': 'bg-cyan-500',
  'Pink': 'bg-pink-500',
  'Indigo': 'bg-indigo-500',
  'Teal': 'bg-teal-500'
};