export type User = {
  id: string;
  fullName: string;
  email: string;
  hash: string;
  username: string;
  role: "user" | "tech" | "admin";
  createdAt: Date;
  active: boolean;
}

export type UserRegister = Partial<Omit<User, "id">>
export type UserLogin = {
  email: string,
  hash: string,
}

export type ContainerRecord = {
  id: string;
  containerId?: string;
  name: string;
  image: string;
  hostPort: string;
  environmentVariables: string[];
  state: string;
  buildId: string;
  projectId: string;
}

export type UserRecord = {
  id: string;
  fullName: string;
  email: string;
  hash: string;
  username: string;
  role: "user" | "tech" | "admin";
  createdAt: Date;
  active: boolean;
}

export type Guides = {
  total: number,
  files: FileEntity[]
}

export type FileEntity = {
  id: string,
  destination: string;
  mimetype: string;
  size: number;
  filename: string;
  originalName: string;
  path: string;
  uploadedAt: Date;
}