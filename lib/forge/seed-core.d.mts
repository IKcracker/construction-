export const FORGE_SAMPLE_PACK_KEY:string;
export type FixtureSummary={records:number;requirements:number;lines:number;milestones:number;activities:number;byModule:Record<string,number>};
export function forgeFixtureSummary(fixtures:unknown):FixtureSummary;
export function installForgeFixtures(database:ReturnType<typeof import("postgres").default>,fixtures:unknown,organizationId:string,userId:string):Promise<{created:boolean;summary:FixtureSummary;installedAt:Date|string}>;
