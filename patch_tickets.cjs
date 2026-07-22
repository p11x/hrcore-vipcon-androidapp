const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Tickets.tsx', 'utf8');

code = code.replace(
  `          if (!selectedTicket && ticketList.length > 0) {
            setSelectedTicket(ticketList[0])
          }`,
  `          setSelectedTicket(prev => {
            if (!prev && ticketList.length > 0) return ticketList[0]
            return prev
          })`
);

fs.writeFileSync('src/pages/admin/Tickets.tsx', code);
