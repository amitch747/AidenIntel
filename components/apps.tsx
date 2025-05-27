import ChatApp from './apps/Chat/ChatApp';
import SettingsApp from './apps/SettingsApp';
import MusicApp from './apps/MusicApp';
import {
  // GrCli,
  GrContact,
  GrSettingsOption,
  // GrBasket,
  // GrCompliance,
  // GrEdit,
  // GrGamepad,
  GrMusic,
} from 'react-icons/gr';

export const APP_REGISTRY = [
  {
    id: 'chat',
    title: 'AidenAI',
    icon: GrContact,
    component: ChatApp,
    defaultPos: { x: 400, y: 175 },
    minDim: { x: 200, y: 150 },
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: GrSettingsOption,
    component: SettingsApp,
    defaultPos: { x: 10, y: 10 },
    minDim: { x: 250, y: 200 },
  },
  // {
  //   id: 'shop',
  //   title: 'Shop',
  //   icon: GrBasket,
  //   component: ShopApp,
  // },
  // {
  //   id: 'notes',
  //   title: 'Notes',
  //   icon: GrCompliance,
  //   component: NotesApp,
  // },
  // {
  //   id: 'draw',
  //   title: 'Draw',
  //   icon: GrEdit,
  //   component: DrawApp,
  // },
  // {
  //   id: 'game',
  //   title: 'Game',
  //   icon: GrGamepad,
  //   component: GameApp,
  // },
  {
    id: 'Music',
    title: 'Music',
    icon: GrMusic,
    component: MusicApp,
    defaultPos: { x: 10, y: 130 },
    minDim: { x: 200, y: 415 },
  },
];
