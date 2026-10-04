import content from './guide-content.json';
export interface VivaQA { question: string; answer: string; }
export interface Step {
  stepNumber: number; title: string; code: string; approach: string;
  whatToLookFor: string[]; technicalNotes: string; commonMistakes: string[];
  screenshotInstructions: string;
}
export interface ModelData {
  modelId: string; modelName: string; modelDescription: string; algorithmType: string;
  memberId: string; memberName: string; studentId: string; steps: Step[]; vivaQuestions: VivaQA[];
}
export type MemberInfo = Pick<ModelData, 'memberId' | 'memberName' | 'studentId' | 'modelId' | 'modelName'>;
export const models: ModelData[] = content;
export const members: MemberInfo[] = models.map(({memberId, memberName, studentId, modelId, modelName}) => ({memberId, memberName, studentId, modelId, modelName}));
export const stepTitles = models[0].steps.map(s => s.title);
export function getModelById(id: string) { return models.find(m => m.modelId === id); }
export function getModelByMemberId(id: string) { return models.find(m => m.memberId === id); }
