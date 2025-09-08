import { FaLinkedin, FaTwitter, FaInstagram, FaDiscord } from 'react-icons/fa';
import { MessageSquare, Lightbulb, PenTool, Image } from 'lucide-react';
import { Option } from '@/types';

// Content types for the first onboarding question
export const CONTENT_TYPES: Option[] = [
  {
    value: 'Custom',
    label: 'Custom Content',
    icon: 'fas fa-magic',
    iconColor: 'indigo',
    description: 'Create content from your own keywords and ideas',
    iconElement: <PenTool className="w-5 h-5 text-indigo-500" />,
  },
  {
    value: 'Thought',
    label: 'Thought Leadership',
    icon: 'fas fa-lightbulb',
    iconColor: 'yellow',
    description: 'Original insights and perspectives',
    iconElement: <Lightbulb className="w-5 h-5 text-yellow-500" />,
  },
  {
    value: 'Educational',
    label: 'Educational',
    icon: 'fas fa-graduation-cap',
    iconColor: 'blue',
    description: 'Informative content that teaches',
  },
  {
    value: 'Promotional',
    label: 'Promotional',
    icon: 'fas fa-bullhorn',
    iconColor: 'purple',
    description: 'Content that promotes products or services',
  },
  {
    value: 'Story',
    label: 'Story',
    icon: 'fas fa-book',
    iconColor: 'green',
    description: 'Narrative content that tells a story',
    iconElement: <MessageSquare className="w-5 h-5 text-green-500" />,
  },
];

// Audience types for the second onboarding question
export const AUDIENCES: Option[] = [
  {
    value: 'Tech VCs',
    label: 'Tech VCs',
    icon: 'fas fa-chart-line',
    iconColor: 'blue',
    description: 'Venture capitalists in the tech industry',
  },
  {
    value: 'Software Developers',
    label: 'Software Developers',
    icon: 'fas fa-code',
    iconColor: 'indigo',
    description: 'Programmers and engineers',
  },
  {
    value: 'Marketing Professionals',
    label: 'Marketing Professionals',
    icon: 'fas fa-bullhorn',
    iconColor: 'purple',
    description: 'Digital and traditional marketers',
  },
  {
    value: 'Startup Founders',
    label: 'Startup Founders',
    icon: 'fas fa-rocket',
    iconColor: 'red',
    description: 'Entrepreneurs building new companies',
  },
  {
    value: 'General Public',
    label: 'General Public',
    icon: 'fas fa-users',
    iconColor: 'green',
    description: 'Broad audience with varied interests',
  },
];

// Tone options for the third onboarding question
export const TONES: Option[] = [
  {
    value: 'Professional',
    label: 'Professional',
    icon: 'fas fa-briefcase',
    iconColor: 'blue',
    description: 'Formal, business-oriented, corporate language',
  },
  {
    value: 'Casual',
    label: 'Casual',
    icon: 'fas fa-coffee',
    iconColor: 'amber',
    description: 'Relaxed, conversational, everyday language',
  },
  {
    value: 'Humorous',
    label: 'Humorous',
    icon: 'fas fa-laugh',
    iconColor: 'yellow',
    description: 'Witty, funny, entertaining with jokes',
  },
  {
    value: 'Educational',
    label: 'Educational',
    icon: 'fas fa-graduation-cap',
    iconColor: 'indigo',
    description: 'Informative, teaching, knowledge-sharing',
  },
  {
    value: 'Inspirational',
    label: 'Inspirational',
    icon: 'fas fa-fire',
    iconColor: 'red',
    description: 'Motivational, uplifting, empowering',
  },
  {
    value: 'GenZ',
    label: 'Gen-Z',
    icon: 'fas fa-mobile-alt',
    iconColor: 'pink',
    description: 'Trendy slang, emojis, viral references',
  },
  {
    value: 'Storytelling',
    label: 'Storytelling',
    icon: 'fas fa-book-open',
    iconColor: 'green',
    description: 'Narrative, personal journey, emotional',
  },
  {
    value: 'Bold',
    label: 'Bold',
    icon: 'fas fa-bolt',
    iconColor: 'orange',
    description: 'Confident, assertive, attention-grabbing',
  },
  {
    value: 'Authentic',
    label: 'Authentic',
    icon: 'fas fa-heart',
    iconColor: 'rose',
    description: 'Genuine, personal, vulnerable sharing',
  },
  {
    value: 'Persuasive',
    label: 'Persuasive',
    icon: 'fas fa-balance-scale',
    iconColor: 'purple',
    description: 'Convincing, compelling, call-to-action',
    iconElement: <PenTool className="w-5 h-5 text-purple-500" />,
  },
];

// Platform options for the fourth onboarding question
export const PLATFORMS: Option[] = [
  {
    value: 'LinkedIn',
    label: 'LinkedIn',
    icon: 'fab fa-linkedin',
    iconColor: 'blue',
    iconElement: <FaLinkedin className="w-5 h-5 text-blue-500" />,
  },
  {
    value: 'Twitter',
    label: 'Twitter',
    icon: 'fab fa-twitter',
    iconColor: 'sky',
    iconElement: <FaTwitter className="w-5 h-5 text-sky-500" />,
  },
  {
    value: 'Instagram',
    label: 'Instagram',
    icon: 'fab fa-instagram',
    iconColor: 'pink',
    iconElement: <FaInstagram className="w-5 h-5 text-pink-500" />,
  },
  {
    value: 'Discord',
    label: 'Discord',
    icon: 'fab fa-discord',
    iconColor: 'indigo',
    iconElement: <FaDiscord className="w-5 h-5 text-indigo-500" />,
  },
];

// Platform-specific colors for UI elements
export const PLATFORM_COLORS: { [key: string]: string } = {
  'LinkedIn': '#0077B5',
  'linkedin': '#0077B5',
  'Twitter': '#1DA1F2',
  'twitter': '#1DA1F2',
  'X': '#1DA1F2',
  'x': '#1DA1F2',
  'Instagram': '#E1306C',
  'instagram': '#E1306C',
  'Discord': '#5865F2',
  'discord': '#5865F2',
  'Facebook': '#1877F2',
  'facebook': '#1877F2',
  'YouTube': '#FF0000',
  'youtube': '#FF0000',
  'TikTok': '#000000',
  'tiktok': '#000000',
};

// Platform-specific styles for content formatting
export const PLATFORM_STYLES: {
  [key: string]: React.CSSProperties;
} = {
  'LinkedIn': {
    fontSize: '15px',
    lineHeight: '1.5',
  },
  'linkedin': {
    fontSize: '15px',
    lineHeight: '1.5',
  },
  'Twitter': {
    fontSize: '16px',
    lineHeight: '1.4',
  },
  'twitter': {
    fontSize: '16px',
    lineHeight: '1.4',
  },
  'X': {
    fontSize: '16px',
    lineHeight: '1.4',
  },
  'x': {
    fontSize: '16px',
    lineHeight: '1.4',
  },
  'Instagram': {
    fontSize: '16px',
    lineHeight: '1.5',
    fontFamily: 'Arial, sans-serif',
  },
  'instagram': {
    fontSize: '16px',
    lineHeight: '1.5',
    fontFamily: 'Arial, sans-serif',
  },
  'Discord': {
    fontSize: '15px',
    lineHeight: '1.6',
    fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  'discord': {
    fontSize: '15px',
    lineHeight: '1.6',
    fontFamily: 'Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  'Facebook': {
    fontSize: '16px',
    lineHeight: '1.5',
  },
  'facebook': {
    fontSize: '16px',
    lineHeight: '1.5',
  },
  'YouTube': {
    fontSize: '16px',
    lineHeight: '1.4',
  },
  'youtube': {
    fontSize: '16px',
    lineHeight: '1.4',
  },
  'TikTok': {
    fontSize: '16px',
    lineHeight: '1.3',
  },
  'tiktok': {
    fontSize: '16px',
    lineHeight: '1.3',
  },
};

// Image options for the fifth onboarding question
export const IMAGE_OPTIONS: Option[] = [
  {
    value: 'Generate via DALL·E',
    label: 'Generate via DALL·E',
    icon: 'fas fa-robot',
    iconColor: 'teal',
    description: 'AI-generated images tailored to your content',
    iconElement: <Image className="w-5 h-5 text-teal-500" />,
  },
  {
    value: 'No Image',
    label: 'No Image',
    icon: 'fas fa-ban',
    iconColor: 'gray',
    description: 'Text-only content with no images',
  },
];