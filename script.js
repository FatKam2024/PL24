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
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let showStadium = true; // Default to showing the stadium

    const translations = {
        TC: {
            today: '今日',
            table: '積分榜',
            allTeams: '所有球隊',
            last: '上月',
            next: '下月',
            showStadium: '顯示球場'
        },
        EN: {
            today: 'Today',
            table: 'Table',
            allTeams: 'All Teams',
            last: 'Last',
            next: 'Next',
            showStadium: 'Show Stadium'
        }
    };

    function parseDate(dateString) {
        const year = parseInt(dateString.substring(0, 4));
        const month = parseInt(dateString.substring(5, 7)) - 1;
        const day = parseInt(dateString.substring(8, 10));
        return new Date(year, month, day);
    }

    function loadMatches() {
        fetch('2024_PL_Match.csv')
            .then(response => response.text())
            .then(data => {
                const matches = data.trim().split('\n').slice(1);
                const matchMap = {};

                matches.forEach(match => {
                    const matchData = match.split(',');
                    if (matchData.length < 6) return;

                    const [date, homeTeamTC, awayTeamTC, homeTeamEN, awayTeamEN, stadiumTC] = matchData;

                    if (!date || !homeTeamTC || !awayTeamTC || !homeTeamEN || !awayTeamEN || !stadiumTC) {
                        return;
                    }

                    const matchDate = parseDate(date.trim());
                    const matchKey = `${matchDate.getFullYear()}-${matchDate.getMonth() + 1}-${matchDate.getDate()}`;

                    if (!matchMap[matchKey]) {
                        matchMap[matchKey] = [];
                    }

                    matchMap[matchKey].push({
                        date: matchDate,
                        homeTeamEN: homeTeamEN.trim(),
                        homeTeamTC: homeTeamTC.trim(),
                        awayTeamEN: awayTeamEN.trim(),
                        awayTeamTC: awayTeamTC.trim(),
                        stadiumTC: stadiumTC.trim(),
                    });
                });

                renderCalendar(matchMap);
            })
            .catch(error => {
                console.error("Error loading CSV data:", error);
            });
    }

    function renderCalendar(matchMap) {
        const calendar = document.getElementById('calendar');
        if (!calendar) return;

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        calendar.innerHTML = '';

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'date-box empty';
            calendar.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateBox = document.createElement('div');
            dateBox.className = 'date-box';

            const currentDate = new Date(currentYear, currentMonth, day);
            const matchKey = `${currentYear}-${currentMonth + 1}-${day}`;

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
                    matchInfo.innerHTML = `<p>${translateTeam(match)} vs ${translateTeam(match, false)}</p>`;
                    
                    if (showStadium) {
                        matchInfo.innerHTML += `<p>${translateStadium(match)}</p>`;
                    }
                    
                    dateBox.appendChild(matchInfo);
                });
            }

            calendar.appendChild(dateBox);
        }
    }

    function translateTeam(match, isHome = true) {
        const team = isHome ? match.homeTeamEN : match.awayTeamEN;
        return language === 'TC' ? teamNames[team] || team : team;
    }

    function translateStadium(match) {
        return language === 'TC' ? match.stadiumTC : match.stadiumTC;
    }

    function loadTeamOptions() {
        const teamSelect = document.getElementById('teamSelect');
        if (!teamSelect) return;

        teamSelect.innerHTML = `<option value="all">${translations[language].allTeams}</option>`;
        Object.keys(teamNames).forEach(enName => {
            const option = document.createElement('option');
            option.value = enName;
            option.textContent = language === 'TC' ? teamNames[enName] : enName;
            teamSelect.appendChild(option);
        });

        updateButtonText('todayBtn', translations[language].today);
        updateButtonText('tableBtn', translations[language].table);
        updateButtonText('langBtn', language === 'TC' ? 'EN' : 'TC');
        updateButtonText('lastMonthBtn', translations[language].last);
        updateButtonText('nextMonthBtn', translations[language].next);

        const showStadiumLabel = document.querySelector('label[for="showStadium"] span');
        if (showStadiumLabel) {
            showStadiumLabel.textContent = translations[language].showStadium;
        }
    }

    function updateButtonText(id, text) {
        const button = document.getElementById(id);
        if (button) {
            button.textContent = text;
        }
    }

    function changeMonth(offset) {
        currentMonth += offset;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear -= 1;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear += 1;
        }
        loadMatches();
    }

    loadTeamOptions();
    loadMatches();

    document.getElementById('todayBtn')?.addEventListener('click', function() {
        const todayElement = document.querySelector('.today-highlight');
        if (todayElement) {
            todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    document.getElementById('teamSelect')?.addEventListener('change', loadMatches);

    document.getElementById('langBtn')?.addEventListener('click', function() {
        language = (language === 'TC') ? 'EN' : 'TC';
        this.textContent = language;
        loadTeamOptions();
        loadMatches();
    });

    document.getElementById('lastMonthBtn')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonthBtn')?.addEventListener('click', () => changeMonth(1));

    document.getElementById('showStadium')?.addEventListener('change', function() {
        showStadium = this.checked;
        loadMatches();
    });
});
