const fs = require('fs');
let code = fs.readFileSync('src/pages/PendingApprovals.tsx', 'utf8');

const imports = `import { Loader2, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react'`;
code = code.replace(`import { Loader2, CheckCircle, Clock } from 'lucide-react'`, imports);

const states = `  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchRegistrations = () => {
    setLoading(true)
    fetch('/api/get-all-pending-registrations')
      .then(res => res.json())
      .then(data => {
        setRegistrations(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  const handleDeny = async (token: string) => {
    if (!window.confirm("Are you sure you want to deny this registration?")) return;
    try {
      const res = await fetch('/api/deny-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      if (res.ok) {
        fetchRegistrations();
      } else {
        alert("Failed to deny registration");
      }
    } catch (e) {
      console.error(e);
      alert("Error denying registration");
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])`;

code = code.replace(/  const \[registrations, setRegistrations\] = useState<any\[\]>\(\[\]\)[\s\S]*?\}, \[\]\)/m, states);

const header = `        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-text-hi">Pending Admin Registrations</h2>
          <button 
            onClick={fetchRegistrations}
            disabled={loading}
            className="p-2 text-text-mid hover:text-primary hover:bg-primary/10 rounded-lg transition-colors focus-ring disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={\`w-5 h-5 \${loading ? 'animate-spin' : ''}\`} />
          </button>
        </div>`;

code = code.replace(`<h2 className="text-2xl font-display font-bold text-text-hi mb-6">Pending Admin Registrations</h2>`, header);

const buttons = `                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDeny(reg.token)}
                    className="px-4 py-2.5 bg-surface border border-border-soft text-text-hi font-medium rounded-xl hover:bg-accent-coral/10 hover:text-accent-coral hover:border-accent-coral/20 transition-all focus-ring"
                    title="Deny"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => navigate(\`/approve-workspace?token=\${reg.token}\`)}
                    className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Verify & Approve
                  </button>
                </div>`;

code = code.replace(`<button\n                  onClick={() => navigate(\`/approve-workspace?token=\${reg.token}\`)}\n                  className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-sm shrink-0"\n                >\n                  Verify & Approve\n                </button>`, buttons);

fs.writeFileSync('src/pages/PendingApprovals.tsx', code);
