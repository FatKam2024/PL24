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

    function parseDate(dateString) {
        // Extract the year, month, and day from the dateString (format: YYYY年MM月DD日)
        const year = parseInt(dateString.substring(0, 4));
        const month = parseInt(dateString.substring(5, 7)) - 1; // JavaScript months are 0-based
        const day = parseInt(dateString.substring(8, 10));
        return new Date(year, month, day);
    }

    function loadMatches() {
        fetch('2024_PL_Match.csv')
            .then(response => response.text())
            .then(data => {
                const matches = data.trim().split('\n').slice(1); // Skip header row and trim any extra spaces
                const calendar = document.getElementById('calendar');
                calendar.innerHTML = ''; // Clear the calendar
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Normalize today's date

                const matchMap = {};

                matches.forEach(match => {
                    const matchData = match.split(',');
                    if (matchData.length < 4) return; // Skip any malformed rows

                    const [date, homeTeam, awayTeam, stadium] = matchData;
                    const matchDate = parseDate(date.trim());

                    const matchKey = `${matchDate.getFullYear()}-${matchDate.getMonth() + 1}-${matchDate.getDate()}`;

                    if (!matchMap[matchKey]) {
                        matchMap[matchKey] = [];
                    }

                    matchMap[matchKey].push({
                        date: matchDate,
                        homeTeam: homeTeam.trim(),
                        awayTeam: awayTeam.trim(),
                        stadium: stadium.trim(),
                    });
                });

                renderCalendar(matchMap);
            });
    }

    function renderCalendar(matchMap) {
        const calendar = document.getElementById('calendar');
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        calendar.innerHTML = '';

        // Create grid cells for days before the first of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'date-box empty';
            calendar.appendChild(emptyCell);
        }

        // Create cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateBox = document.createElement('div');
            dateBox.className = 'date-box';

            const currentDate = new Date(year, month, day);
            const matchKey = `${year}-${month + 1}-${day}`;

            if (currentDate.getTime() === today.getTime()) {
                dateBox.classList.add('today-highlight');
            }

            const dateHeading = document.createElement('h3');
            dateHeading.textContent = `${day} (${['日', '一', '二', '三', '四', '五', '六'][currentDate.getDay()]})`;
            dateBox.appendChild(dateHeading);

            if (matchMap[matchKey]) {
                matchMap[matchKey].forEach(match => {
                    const matchInfo = document.createElement('div');
                    matchInfo.className = 'match-info';
                    matchInfo.innerHTML = `<p>${translateTeam(match.homeTeam)} vs ${translateTeam(match.awayTeam)}</p><p>${match.stadium}</p>`;
                    dateBox.appendChild(matchInfo);
                });
            }

            calendar.appendChild(dateBox);
        }
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

        // Update button labels based on language
        document.getElementById('todayBtn').textContent = language === 'TC' ? '今日' : 'Today';
        document.getElementById('tableBtn').textContent = language === 'TC' ? '積分榜' : 'Table';
        document.getElementById('langBtn').textContent = language === 'TC' ? 'EN' : 'TC';
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
        fetch('2024_PL_Match.csv')
            .then(response => response.text())
            .then(data => {
                const matches = data.trim().split('\n').slice(1); // Skip header row
                
                const matchMap = {};

                matches.forEach(match => {
                    const matchData = match.split(',');
                    if (matchData.length < 4) return; // Skip any malformed rows

                    const [date, homeTeam, awayTeam, stadium] = matchData;
                    const matchDate = parseDate(date.trim());

                    if (selectedTeam !== 'all' && homeTeam.trim() !== selectedTeam && awayTeam.trim() !== selectedTeam) {
                        return; // Skip matches that don't involve the selected team
                    }

                    const matchKey = `${matchDate.getFullYear()}-${matchDate.getMonth() + 1}-${matchDate.getDate()}`;

                    if (!matchMap[matchKey]) {
                        matchMap[matchKey] = [];
                    }

                    matchMap[matchKey].push({
                        date: matchDate,
                        homeTeam: homeTeam.trim(),
                        awayTeam: awayTeam.trim(),
                        stadium: stadium.trim(),
                    });
                });

                renderCalendar(matchMap);
            });
    });

    document.getElementById('langBtn').addEventListener('click', function() {
        language = (language === 'TC') ? 'EN' : 'TC';
        this.textContent = language;
        loadTeamOptions(); // Reload team options in the selected language
        loadMatches(); // Reload matches in the selected language
    });
});
