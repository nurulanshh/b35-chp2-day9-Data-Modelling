const express = require ('express');

const db = require('./connection/db')

const app = express()
const port = 3000

const isLogin = true;

const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',];


let projects = [
  {
  id: 1,
  title: 'Dumbways Web App - 2021',
  author: 'Nurul Anisah',
  startDate: '2021-01-12',
  endDate: '2021-03-12',
  duration: '3 month',
  nodejs: '/public/assets/nodejs.png',
  reactjs: '/public/assets/reactjs.png',
  js: '/public/assets/js.png',
  typescript: '/public/assets/typescript.png',
  content: 'App that used for Dumbways student, it was deployed and can downloaded on playstore. Happy download',
  image: ''
}
];

// TEST CONNECTION DB
//db.connect(function(err, _, done){
//  if (err) throw err;

//  console.log('Database Connection Success');
//});

app.set('view engine', 'hbs'); //setup template engine / view engine

app.use('/public', express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: false }));

// Routing GET
app.get('/', (req, res) => {

  db.connect(function(err, client, done) {
    if (err) throw err;
  
  const query = 'SELECT * FROM tb_project';

  client.query(query, function (err, result){
    if (err) throw err;

  const projectsData = result.rows;

  const newProject = projectsData.map((project) => {
  project.isLogin = isLogin;
  project.duration = durationTime(project['start_date'],project['end_date']);
  project.time = getFullTime(project['start_date']);
    return project;
  });

  console.log(newProject);

  res.render('index', {isLogin: isLogin, projects: newProject});
  });

  done();
});
});


app.get('/add-project',(req, res) =>{
  res.render('add-project')

});

app.get('/contact-me', (req, res) => {
    res.render('contact-me');
  });

app.get('/delete-project/:id', (req, res) => {
    const id = req.params.id;
    const removeIndex = projects.findIndex( item => item.id === id );
    projects.splice( removeIndex, 1 );
    res.redirect('/');
});

app.get('/project-detail/:index', function (req, res){
db.connect(function(err, client, done) {
    if (err) throw err;
  
  const query = 'SELECT * FROM tb_project';

  client.query(query, function (err, result){
    if (err) throw err;
    
    const index = req.params.index;
    const project = result.rows[index];
    const detail = project;  

    detail.duration = difference(detail["start_date"], detail["end_date"]);
    detail.date = getFullTime(detail["start_date"], detail["start_date"]);

    res.render('project-detail', {isLogin: isLogin, detail: detail})
    });
    done();
  });
})


app.get('/edit-project/:index', function(req, res){
  const index = req.params.index;
  const edit = projects[index];  

  res.render('edit-project', {isLogin: isLogin, edit, id:index})
});

 // Routing POST 
  app.post('/contact-me', (req, res) => {
    const data = req.body;

      res.redirect('/contact-me');
  });
  
  
  app.post('/add-project', (req, res) => {
    const data = req.body;
    const name = req.body.name;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const description = req.body.description;
    const image = req.body.image;
    const technologies = [];
    if (req.body.nodejs) {
         technologies.push('nodejs');
     } else {
         technologies.push('')
     }
     if (req.body.reactjs) {
         technologies.push('reactjs');
     } else {
         technologies.push('')
     }
     if (req.body.js) {
         technologies.push('js');
     } else {
         technologies.push('')
     }
     if (req.body.typescript) {
         technologies.push('typescript');
     } else {
         technologies.push('')
     }
   
     db.connect(function (err, client, done) {
      if (err) throw err;
  
      const query = `INSERT INTO tb_project (name, start_date, end_date, description, technologies, image) 
                     VALUES ('${name}', '${start_date}', '${end_date}', '${description}', ARRAY ['${technologies[0]}', '${technologies[1]}','${technologies[2]}', '${technologies[3]}'], '${image}')`
  
      client.query(query, function (err, result) {
        if (err) throw err;

    projects.push(data);
    console.log(projects);


    res.redirect('/');
});

done();
});
});


app.post('/edit-project/:index', (req, res) => {
  const data = req.body;
  const index = req.params.index;

  data.duration = durationTime(data['startDate'],data['endDate']);
  data.time = getFullTime(data['startDate'],data['startDate']);
  
  console.log(data);

  projects[index]=data;
  console.log(projects);


  res.redirect('/');
});



app.listen(port, () => {
    console.log(`Server running on PORT: ${port}`);
  });


  

  //function

  function durationTime(start_date, end_date) {
    // Convert Start - End Date to Days
    let newStartDate = new Date(start_date)
    let newEndDate = new Date(end_date)
    let duration = Math.abs(newStartDate - newEndDate)
  
    let day = Math.floor(duration / (1000 * 60 * 60 * 24))
  
    if (day < 30) {
      return day + ` days `
    } 
    
    else {
      let diffMonths = Math.ceil(duration / (1000 * 60 * 60 * 24 * 30));
      if (diffMonths >= 1) {
        return diffMonths + ` months `
      }

      if (diffMonths < 12) {
        return diffMonths + ` months `
      } 
      
      else {
        let diffYears = Math.ceil(duration / (1000 * 60 * 60 * 24 * 30 * 12));
        if (diffYears >= 1) {
          return diffYears + ` years `
        }
      }
    }

    
  };

  function getFullTime(time) {
    time = new Date(time);
    const date = time.getDate();
    const monthIndex = time.getMonth();
    const year = time.getFullYear();
    let hour = time.getHours();
    let minute = time.getMinutes();
  
    if (hour < 10) {
      hour = '0' + hour;
    }
  
    if (minute < 10) {
      minute = '0' + minute;
    }
  
    const fullTime = `${date} ${month[monthIndex]} ${year} ${hour}:${minute} WIB`;
  
    return fullTime;
  }


  