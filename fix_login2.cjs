const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// The extra </div>s are right after </button> for the login and register tab buttons.
code = code.replace(/Login\s*<\/button>\s*<\/div>/g, 'Login\n            </button>');
code = code.replace(/Register\s*<\/button>\s*<\/div>/g, 'Register\n            </button>');
code = code.replace(/Create Admin Account'}\s*<\/button>\s*<\/div>/g, "Create Admin Account'}\n                </button>");

fs.writeFileSync('src/pages/Login.tsx', code);
