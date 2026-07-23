const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const regex = /{isLoggingIn \? 'Verifying\.\.\.' : 'Sign In'}\s*<\/button>([\s\S]*?)<\/motion\.form>/g;
code = code.replace(regex, `{isLoggingIn ? 'Verifying...' : 'Sign In'}
                </button>
                <div className="mt-4 p-3 bg-primary/10 rounded-lg text-xs text-primary text-center">
                  <strong>Demo Admin:</strong> admin@hrcore.dev / admin123
                </div>
              </motion.form>`);

fs.writeFileSync('src/pages/Login.tsx', code);
