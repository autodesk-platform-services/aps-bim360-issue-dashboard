import { initTree } from './sidebar.js';
import { refreshReports} from './dashboard.js';

var correntProjectId= ''
var correntContainerId= ''
const login = document.getElementById('login');
try {
    const resp = await fetch('/api/auth/profile');
    if (resp.ok) {
        const user = await resp.json();
        login.innerText = `Logout (${user.name})`;
        login.onclick = () => window.location.replace('/api/auth/logout');
        initTree('#projectTree', async (projectId, containerId) => {
          correntProjectId = projectId
          correntContainerId = containerId
          refreshReports(correntProjectId,correntContainerId);
        });
    } else {
        login.innerText = 'Login';
        login.onclick = () => window.location.replace('/api/auth/login');
    }
    login.style.visibility = 'visible';

    //initialization
    init();

} catch (err) {
    alert('Could not initialize the application. See console for more details.');
    console.error(err);
}

async function init() {
    $('#oneWeekDueIssueDate').datepicker('setDate',new Date());
    $('#oneWeekDueIssueDate').datepicker({autoclose: true}); 
  
    $('#oneWeekDueIssueDate').change(function () { 
      refreshReports(correntProjectId,correntContainerId);
    });
}

