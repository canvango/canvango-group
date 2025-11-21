import fs from 'fs';
import path from 'path';

export interface EnvVars {
  GITHUB_TOKEN?: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

export async function writeEnvFile(vars: EnvVars): Promise<void> {
  const envPath = path.join(process.cwd(), '.env');
  
  // Read existing .env file if it exists
  let existingContent = '';
  let existingVars: Record<string, string> = {};
  
  if (fs.existsSync(envPath)) {
    existingContent = fs.readFileSync(envPath, 'utf-8');
    
    // Parse existing variables
    existingContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          existingVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  }

  // Merge new variables with existing ones
  Object.entries(vars).forEach(([key, value]) => {
    if (value !== undefined) {
      existingVars[key] = value;
    }
  });

  // Build new .env content
  const lines: string[] = [];
  
  // GitHub section
  if (existingVars.GITHUB_TOKEN || existingVars.GITHUB_OWNER || existingVars.GITHUB_REPO) {
    lines.push('# GitHub Configuration');
    if (existingVars.GITHUB_TOKEN) {
      lines.push(`GITHUB_TOKEN=${existingVars.GITHUB_TOKEN}`);
    }
    if (existingVars.GITHUB_OWNER) {
      lines.push(`GITHUB_OWNER=${existingVars.GITHUB_OWNER}`);
    }
    if (existingVars.GITHUB_REPO) {
      lines.push(`GITHUB_REPO=${existingVars.GITHUB_REPO}`);
    }
    lines.push('');
  }

  // Supabase section
  if (existingVars.SUPABASE_URL || existingVars.SUPABASE_ANON_KEY || existingVars.SUPABASE_SERVICE_ROLE_KEY) {
    lines.push('# Supabase Configuration');
    if (existingVars.SUPABASE_URL) {
      lines.push(`SUPABASE_URL=${existingVars.SUPABASE_URL}`);
    }
    if (existingVars.SUPABASE_ANON_KEY) {
      lines.push(`SUPABASE_ANON_KEY=${existingVars.SUPABASE_ANON_KEY}`);
    }
    if (existingVars.SUPABASE_SERVICE_ROLE_KEY) {
      lines.push(`SUPABASE_SERVICE_ROLE_KEY=${existingVars.SUPABASE_SERVICE_ROLE_KEY}`);
    }
    lines.push('');
  }

  // Add any other existing variables that we don't manage
  const managedKeys = ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const otherVars = Object.entries(existingVars).filter(([key]) => !managedKeys.includes(key));
  
  if (otherVars.length > 0) {
    lines.push('# Other Configuration');
    otherVars.forEach(([key, value]) => {
      lines.push(`${key}=${value}`);
    });
  }

  // Write to file
  const content = lines.join('\n');
  fs.writeFileSync(envPath, content, { mode: 0o600 }); // Set file permissions to read/write for owner only

  console.log(`✅ Environment variables written to ${envPath}`);
}

export function readEnvFile(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const vars: Record<string, string> = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        vars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return vars;
}
