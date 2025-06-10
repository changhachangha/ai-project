import type { LucideIcon } from 'lucide-react';

// 두 파일에서 공통으로 사용하던 타입을 이 파일에 정의합니다.
export type Integration = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
  color: string;
};
