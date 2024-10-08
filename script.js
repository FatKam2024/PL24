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

    const teamCodes = {
        'BHA': 'Brighton & Hove Albion',
        'ARS': 'Arsenal',
        'LIV': 'Liverpool',
        'MCI': 'Manchester City',
        'AVL': 'Aston Villa',
        'BRE': 'Brentford',
        'MUN': 'Manchester United',
        'NEW': 'Newcastle United',
        'BOU': 'Bournemouth',
        'NFO': 'Nottingham Forest',
        'LEI': 'Leicester City',
        'TOT': 'Tottenham Hotspur',
        'CRY': 'Crystal Palace',
        'WHU': 'West Ham United',
        'FUL': 'Fulham',
        'SOU': 'Southampton',
        'CHE': 'Chelsea',
        'IPS': 'Ipswich Town',
        'WOL': 'Wolverhampton Wanderers',
        'EVE': 'Everton'
    };

    let language = 'TC';
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let showStadium = false;
    let selectedTeam = 'all';

    const translations = {
        TC: {
            today: '今日',
            table: '積分榜',
            allTeams: '所有球隊',
            last: '上月',
            next: '下月',
            showStadium: '顯示球場',
            months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
        },
        EN: {
            today: 'Today',
            table: 'Table',
            allTeams: 'All Teams',
            last: 'Last',
            next: 'Next',
            showStadium: 'Show Stadium',
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        }
    };

    function parseDate(dateString) {
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    function loadMatches() {
        fetch('2024_PL_Match.csv')
            .then(response => response.text())
            .then(data => {
                const matches = data.trim().split('\n').slice(1);
                const matchMap = {};

                matches.forEach(match => {
                    const matchData = match.split(',');
                    if (matchData.length < 10) return;

                    const [date, timeHKT, weekday, homeTeam, awayTeam, homeTeamCode, awayTeamCode, homeTeamTC, awayTeamTC, stadiumTC, stadium] = matchData;

                    if (!date || !timeHKT || !homeTeamTC || !awayTeamTC || !homeTeamCode || !awayTeamCode || !stadiumTC || !stadium) {
                        return;
                    }

                    const matchDate = parseDate(date.trim());
                    const matchKey = `${matchDate.getFullYear()}-${matchDate.getMonth() + 1}-${matchDate.getDate()}`;

                    if (!matchMap[matchKey]) {
                        matchMap[matchKey] = [];
                    }

                    matchMap[matchKey].push({
                        date: matchDate,
                        timeHKT: timeHKT.trim(),
                        homeTeamCode: homeTeamCode.trim(),
                        homeTeamTC: homeTeamTC.trim(),
                        awayTeamCode: awayTeamCode.trim(),
                        awayTeamTC: awayTeamTC.trim(),
                        stadiumTC: stadiumTC.trim(),
						stadium: stadium.trim(),
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

        const monthIndicator = document.createElement('h2');
        monthIndicator.textContent = translations[language].months[currentMonth] + ' ' + currentYear;
        monthIndicator.className = 'month-indicator';
        calendar.appendChild(monthIndicator);

        const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
        daysOfWeek.forEach(day => {
            const dayLabel = document.createElement('div');
            dayLabel.className = 'day-label';
            dayLabel.textContent = day;
            calendar.appendChild(dayLabel);
        });

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
            dateHeading.textContent = `${day} (${daysOfWeek[currentDate.getDay()]})`;
            dateBox.appendChild(dateHeading);

            if (matchMap[matchKey]) {
                matchMap[matchKey].forEach(match => {
                    if (selectedTeam === 'all' || 
                        teamCodes[match.homeTeamCode] === selectedTeam || 
                        teamCodes[match.awayTeamCode] === selectedTeam) {
                        
                        const matchInfo = document.createElement('div');
                        matchInfo.className = 'match-info';
                        matchInfo.innerHTML = `<span class="team-name">${translateTeam(match)}</span> vs <span class="team-name">${translateTeam(match, false)}</span> <span class="time-info">(${match.timeHKT})</span>`;
                        
                        if (showStadium) {
                            matchInfo.innerHTML += `<br><span class="stadium-info">${translateStadium(match)}</span>`;
                        }
                        
                        dateBox.appendChild(matchInfo);
                    }
                });
            }

            calendar.appendChild(dateBox);
        }
    }

    function translateTeam(match, isHome = true) {
        const teamCode = isHome ? match.homeTeamCode : match.awayTeamCode;
        const teamTC = isHome ? match.homeTeamTC : match.awayTeamTC;
        return language === 'TC' ? teamTC : teamCode;
    }

	function translateStadium(match) {
		if (language === 'TC') {
			return match.stadiumTC; // Return the Traditional Chinese name
		} else if (language === 'EN') {
			return match.stadium; // Assuming you have an English stadium name in match.stadiumEN
		}
		return match.stadiumTC; // Default to Traditional Chinese if no match found
	}

    function loadTeamOptions() {
        const teamSelect = document.getElementById('teamSelect');
        if (!teamSelect) return;

        teamSelect.innerHTML = `<option value="all">${translations[language].allTeams}</option>`;
        Object.keys(teamCodes).forEach(code => {
            const enName = teamCodes[code];
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

    function goToToday() {
        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth();
        loadMatches();
        
        setTimeout(() => {
            const todayElement = document.querySelector('.today-highlight');
            if (todayElement) {
				todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }

    function openPremierLeagueTable() {
        window.open('https://www.premierleague.com/tables', '_blank');
    }
	
    loadTeamOptions();
    loadMatches();

    document.getElementById('todayBtn')?.addEventListener('click', goToToday);
    document.getElementById('teamSelect')?.addEventListener('change', function() {
        selectedTeam = this.value;
        loadMatches();
    });
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
    document.getElementById('tableBtn')?.addEventListener('click', openPremierLeagueTable); // Changed to use window.open()


    // Add this function to handle responsive layout changes
    function handleResponsiveLayout() {
        const isMobile = window.innerWidth <= 768;
        const calendar = document.getElementById('calendar');
        if (calendar) {
            if (isMobile) {
                calendar.classList.add('mobile-view');
            } else {
                calendar.classList.remove('mobile-view');
            }
        }
    }
	
    // Call the function initially and add event listener for window resize
    handleResponsiveLayout();
    window.addEventListener('resize', handleResponsiveLayout);
});
