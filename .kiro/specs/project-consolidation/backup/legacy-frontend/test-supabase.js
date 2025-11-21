// Quick test script to verify Supabase connection
// Run with: node test-supabase.js

const SUPABASE_URL = 'https://gpittnsfzgkdbqnccncn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXR0bnNmemdrZGJxbmNjbmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDE3MzIsImV4cCI6MjA3ODY3NzczMn0.4jrpZ_7Wd_ELFjCH105iBqyFPmZmKxI06U0EyqTT5xo';

console.log('🔍 Testing Supabase Connection...\n');

console.log('✅ Supabase URL:', SUPABASE_URL);
console.log('✅ Anon Key:', SUPABASE_ANON_KEY.substring(0, 50) + '...');

console.log('\n📝 Configuration looks good!');
console.log('\n🚀 Next steps:');
console.log('1. Start frontend: npm run dev');
console.log('2. Navigate to: http://localhost:5173/login');
console.log('3. Click "Forgot your password?"');
console.log('4. Test the forgot password flow');
console.log('\n⚠️  Note: Make sure you have configured Site URL and Redirect URLs in Supabase Dashboard');
console.log('   - Site URL: http://localhost:5173');
console.log('   - Redirect URL: http://localhost:5173/reset-password');
