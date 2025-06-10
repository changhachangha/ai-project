import { encodingTools } from './encoding-tools';
import type { Integration } from './types';
import { 
  Database, 
  Globe, 
  Mail, 
  MessageSquare, 
  Calendar,
  BarChart3,
  FileText,
  Shield,
  Zap,
  Users
} from 'lucide-react';

// 추가 Integration 데이터 (예제)
const otherIntegrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and collaboration platform',
    category: 'Communication',
    icon: MessageSquare,
    color: '#4A154B',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Schedule and manage your time effectively',
    category: 'Productivity',
    icon: Calendar,
    color: '#4285F4',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace for notes, docs, and collaboration',
    category: 'Productivity',
    icon: FileText,
    color: '#000000',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Version control and collaborative development',
    category: 'Development',
    icon: Globe,
    color: '#181717',
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    description: 'Advanced open source relational database',
    category: 'Database',
    icon: Database,
    color: '#336791',
  },
  {
    id: 'analytics',
    name: 'Google Analytics',
    description: 'Web analytics and insights platform',
    category: 'Analytics',
    icon: BarChart3,
    color: '#E37400',
  },
  {
    id: 'auth0',
    name: 'Auth0',
    description: 'Identity and access management platform',
    category: 'Security',
    icon: Shield,
    color: '#EB5424',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automate workflows between apps',
    category: 'Automation',
    icon: Zap,
    color: '#FF4A00',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing and automation platform',
    category: 'Marketing',
    icon: Mail,
    color: '#FFE01B',
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Customer messaging and support platform',
    category: 'Customer Support',
    icon: Users,
    color: '#338EF7',
  },
];

// 모든 도구들을 합칩니다.
export const allTools: Integration[] = [...encodingTools, ...otherIntegrations];

// 모든 도구들을 카테고리별로 그룹화합니다.
const groupedTools = allTools.reduce(
  (acc, tool) => {
    // 현재 도구의 카테고리를 찾습니다.
    let group = acc.find((g) => g.category === tool.category);

    // 그룹이 없으면 새로 생성합니다.
    if (!group) {
      group = { category: tool.category, tools: [] };
      acc.push(group);
    }

    // 현재 그룹에 도구를 추가합니다.
    group.tools.push(tool);

    return acc;
  },
  [] as { category: string; tools: Integration[] }[]
);

// 외부에서 사용할 데이터들을 export 합니다.
export { groupedTools };
export const allCategories: string[] = [
  'All',
  ...groupedTools.map((g) => g.category),
];
