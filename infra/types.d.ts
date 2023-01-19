type StackConfig = {
  name: string;
  stage: string;
  project: string;
  pulumiOrganization: string;
  getTags(): { [name: string]: string };
  generateResourceName(service: string): string;
};
