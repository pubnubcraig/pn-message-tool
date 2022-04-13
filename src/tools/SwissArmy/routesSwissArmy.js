// @mui/icons-material
//////////////////////

import { MessageRounded } from '@mui/icons-material';

// tool components
//////////////////

import {SwissArmyProvider} from "./SwissArmyProvider"
import BufferDump from './pages/BufferDump';
import MessageGenerator from './pages/MessageGenerator';
import ChannelBrowser from './pages/ChannelBrowser';

var routesSwissArmy = {
  collapse: true,
  name: "Message Tools",
  icon: MessageRounded,
  iconColor: "Error",
  state: "swissArmyCollapse",
  views: [
    {
      path: "/swissarmy/message-generator",
      name: "Message Generator",
      component: MessageGenerator,
      parent: SwissArmyProvider,
      layout: "/admin",
    },
    {
      path: "/swissarmy/channel-browser",
      name: "Channel Browser",
      component: ChannelBrowser,
      parent: SwissArmyProvider,
      layout: "/admin",
    },
    {
      path: "/swissarmy/buffer-dump",
      name: "Buffer Dump",
      component: BufferDump,
      parent: SwissArmyProvider,
      layout: "/admin",
    },
  ]
};

export default routesSwissArmy;
