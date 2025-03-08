
import React from "react";
import { 
  BarChart, 
  LineChart, 
  Users, 
  LightbulbIcon, 
  TrendingUp, 
  Target, 
  PercentIcon,
  Brain 
} from "lucide-react";

interface ResultIconProps {
  type: string;
}

export const ResultIcon: React.FC<ResultIconProps> = ({ type }) => {
  switch(type) {
    case 'sales':
      return <BarChart className="h-4 w-4" />;
    case 'trend':
      return <LineChart className="h-4 w-4" />;
    case 'customers':
      return <Users className="h-4 w-4" />;
    case 'insights':
      return <LightbulbIcon className="h-4 w-4" />;
    case 'marketing':
      return <Target className="h-4 w-4" />;
    case 'performance':
      return <PercentIcon className="h-4 w-4" />;
    case 'growth':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Brain className="h-4 w-4" />;
  }
};
