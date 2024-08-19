document.addEventListener('DOMContentLoaded', function() {
    const teamNames = {
        'Brighton & Hove Albion': '白禮頓',
        'Arsenal': '阿仙奴',
        'Liverpool': '利物浦',
        'Manchester City': '曼城',
        'Aston Villa': '阿士東維拉',
        'Brentford': '賓福特',
        'Manchester United': '曼聯',
        'Newcastle United': '紐卡素',
        'Bournemouth': '般尼茅夫',
        'Nottingham Forest': '諾定咸森林',
        'Leicester City': '李斯特城',
        'Tottenham Hotspur': '熱刺',
        'Crystal Palace': '水晶宮',
        'West Ham United': '韋斯咸',
        'Fulham': '富咸',
        'Southampton': '修咸頓',
        'Chelsea': '車路士',
        'Ipswich Town': '葉士域治',
        'Wolverhampton Wanderers': '狼隊',
        'Everton': '愛華頓'
    };

    let language = 'TC'; // Default language is Traditional Chinese

    function loadMatches() {
        fetch('2024_PL_Match.csv')
            .then(response => response.text())
            .then(data => {
                const matches = data.split('\n').slice(1); // Skip header row
                const calendar = document.getElementById('calendar');
                calendar.innerHTML = ''; // Clear the calendar
                const today = new Date().toISOString().split('T')[0];

                matches.forEach(match => {
                    const [date, homeTeam, awayTeam, stadium] = match.split(',');
                    const matchDate = new Date(date.trim()).toISOString().split('T')[0];
                    
                    // Create date box
                    const dateBox = document.createElement('div');
                    dateBox.className = 'date-box';
                    if (matchDate === today) {
                        dateBox.classList.add('today-highlight');
                    }
                    
                    // Add match details
                    const dateHeading = document.createElement('h3');
                    dateHeading.textContent = date.trim();
                    dateBox.appendChild(dateHeading);

                    const matchInfo = document.createElement('div');
                    matchInfo.className = 'match-info';
                    matchInfo.innerHTML = `<p>${translateTeam(homeTeam.trim())} vs ${translateTeam(awayTeam.trim())}</p><p>${stadium.trim()}</p>`;
                    dateBox.appendChild(matchInfo);
                    
                    // Append to calendar
                    calendar.appendChild(dateBox);
                });
            });
    }

    function translateTeam(team) {
        return (language === 'TC') ? teamNames[team] : team;
    }

    function loadTeamOptions() {
        const teamSelect = document.getElementById('teamSelect');
        teamSelect.innerHTML = `<option value="all">${language === 'TC' ? '所有球隊' : 'All Teams'}</option>`;
        Object.keys(teamNames).forEach(enName => {
            const option = document.createElement('option');
            option.value = enName;
            option.textContent = language === 'TC' ? teamNames[enName] : enName;
            teamSelect.appendChild(option);
        });
    }

    // Initial load
    loadTeamOptions();
    loadMatches();

    document.getElementById('todayBtn').addEventListener('click', function() {
        const todayElement = document.querySelector('.today-highlight');
        if (todayElement) {
            todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    document.getElementById('teamSelect').addEventListener('change', function() {
        const selectedTeam = this.value;
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = ''; // Clear the current calendar

        fetch('2024_PL_Match.csv')
            .then(response => response.text())
            .then(data => {
                const matches = data.split('\n').slice(1); // Skip header row
                
                matches.forEach(match => {
                    const [date, homeTeam, awayTeam, stadium] = match.split(',');
                    if (selectedTeam === 'all' || homeTeam.trim() === selectedTeam || awayTeam.trim() === selectedTeam) {
                        // Recreate date box
                        const dateBox = document.createElement('div');
                        dateBox.className = 'date-box';
                        
                        // Add match details
                        const dateHeading = document.createElement('h3');
                        dateHeading.textContent = date.trim();
                        dateBox.appendChild(dateHeading);

                        const matchInfo = document.createElement('div');
                        matchInfo.className = 'match-info';
                        matchInfo.innerHTML = `<p>${translateTeam(homeTeam.trim())} vs ${translateTeam(awayTeam.trim())}</p><p>${stadium.trim()}</p>`;
                        dateBox.appendChild(matchInfo);
                        
                        // Append to calendar
                        calendar.appendChild(dateBox);
                    }
                });
            });
    });

    document.getElementById('langBtn').addEventListener('click', function() {
        language = (language === 'TC') ? 'EN' : 'TC';
        this.textContent = language;
        loadTeamOptions(); // Reload team options in the selected language
        loadMatches(); // Reload matches in the selected language
    });
});
