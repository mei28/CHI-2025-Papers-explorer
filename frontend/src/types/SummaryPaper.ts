export interface SummaryPaper {
  id: string;
  title: string;
  authors: string;
  year: string;
  journal: string;
  url: string;
  doi?: string;
  summary_english: string;
  problem_english: string;
  method_english: string;
  results_english: string;
  summary_japanese: string;
  problem_japanese: string;
  method_japanese: string;
  results_japanese: string;
}
