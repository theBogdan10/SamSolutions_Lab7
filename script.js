function getUrl() {
  const input = document.getElementById('username');
  const id = input.value;
  return `https://api.github.com/users/${id}/repos`;
}

async function getRepos() {
  const response = await fetch(getUrl());
  if (response.status === 200) {
    const list_Obj = await response.json();
    return await [...list_Obj].map(i => [i.name, i.created_at]).sort((a, b) => a[1] < b[1] ? -1 : 1);
  } else {}
};

function getBestRepos() {
  return new Promise((resolve, reject) => {
    const requs = new XMLHttpRequest();
    requs.open("GET", getUrl());
    requs.onload = () => {
      if (requs.status === 200) {
        resolve([...JSON.parse(requs.responseText)].map(i => [i.name, i.watchers_count]).sort((a, b) => b[1] - a[1])[0]);
      } else {}
    }
    requs.send(null);
  })
}

function fill(repos) {
  let str = '';
  for (let key in repos) {
    if (typeof(repos[key]) === 'object' && repos[key]) {
      str += `<strong>${key}</strong><br>`
      str += `${fill(repos[key])}</ul><br>`;
    } else {
      str += `<strong>${key}</strong><br>${repos[key]}<br>`;
    }
  }
  return str;
}

async function loadDetails() {
  const response = await fetch(getUrl());
  if (response.status === 200) {
    const repos = await response.json();
    const list = document.getElementById('details__list');
    const select = document.getElementById('repos__select');
    const selected = select[select.selectedIndex].value.split(' ')[0];
    const repo = [...repos].find(i => i.name === selected);
    list.innerHTML = '';
    list.insertAdjacentHTML('beforeend', fill(repo));
  } else {}
}

document.body.onload = () => {
  let oldValue = '';
  let timer = null;
  document.getElementById('username').addEventListener('keyup', (e) => {
    if (e.target.value != oldValue) init();
    oldValue = e.target.value;
  })
  document.getElementById('repos__select').addEventListener('change', () => {
    loadDetails();
  })
  document.getElementById('list-update__button').addEventListener('change', (e) => {
    if (e.target.checked) {
      timer = setInterval(async () => {
        const oldRepos = init.repos;
        const repos = await getRepos();
        (JSON.stringify(oldRepos) != JSON.stringify(repos)) && init();
      }, 10000);
    } else {
      clearInterval(timer);
      timer = null;
    }
  })
  init();
};

async function init() {
  init.repos = await getRepos();
  const list = document.getElementById('repos__select');
  document.getElementById('best__span').innerText = `The best is ${(await getBestRepos())[0]}!`;
  list.innerHTML = '';
  init.repos.forEach(i => {
    const option = document.createElement('option');
    option.text = `${i[0]} [${(new Date(i[1])).toLocaleDateString()}]`;
    list.add(option);
  })
  loadDetails();
}