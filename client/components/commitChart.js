//@TODO: take out hardcoded value in d3.json and replace it with a variable
//@TODO: integrate with a style sheet (if desired at that point edit .axis text to have better font)
//@TODO: make the 'week' array depend on the data received / day-of-the-week that the API request was made
//@TODO: make sure we don't get an error relating to the d3.json having not returned
//@TODO: decide what to do in case of a tie! The obvious thing is to opacity-1/2 (or 1/4) 2 exactly overlapping rects

module.exports = (data) => {

  var recentActivity = data.owner.slice(data.owner.length - 13, data.owner.length);
  var beginningOfActivityIndex = 0;
  while (recentActivity[beginningOfActivityIndex] === 0) { 
    beginningOfActivityIndex++; 
  }
  // show only the last 13 weeks of data, or last N weeks if commit activity is only in last N weeks,
  // but if all last 13 weeks had no data, just show a flat graph of 13 weeks of 0 activity
  // if (beginningOfActivityIndex !== 12) {
  recentActivity = recentActivity.slice(beginningOfActivityIndex, recentActivity.length);
  // }

  // generate time axis -- start with week
  // recentActivity = data;
  console.log('data is:', data);
  const generateTimeAxisTicks = () => {
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    var timeAxis = [], lastSunday, timeString;
    if (recentActivity.length > 0) {
      timeAxis.push((today.getMonth()+1) + '/' + today.getDate());
    
      for (var i = 1; i < recentActivity.length; i++) {
          var lastSunday = i === 1 ? new Date(today.setDate(today.getDate()-today.getDay())) : new Date(lastSunday - 604800000);
          timeString = (lastSunday.getMonth()+1) + '/' + lastSunday.getDate();
          timeAxis.push(timeString);
      }
    }
    return timeAxis;
  };
  var timeAxis = generateTimeAxisTicks();
  console.log('timeAxisTicks', timeAxis);
  // d3.json("https://api.github.com/repos/Groovy-Narwhal/GitAchieve/stats/commit_activity", (error, data) => {
  //   if (error) {
  //     console.log('There was an error retrieving commit data: ', error);
  //   }

  //   /*************
  //    Data storage stuff
  //   *************/

  //   // Our user's set of data -- unsure how to add a second set in right now
  //   // We slice off the last week because we decided to care only about the last week of Git activity
  //   // Data looks something like this: {total: 35, days: [2, 5, 17, 0, 0, 1]}
  //   var users = [];
  //   var userCommits = data[data.length - 1];
  //   users.push(userCommits.days);

  //   // Keep track of usernames. FOR NOW THESE ARE HARDCODED.
  //   // Slice off only the first 9 characters to get a fairly uniform max length when they're used in the graph's legend
  //   var usernames = [];
  //   usernames.push('@msmith9393'.slice(0, 9));
  //   usernames.push('@adamrgisom'.slice(0, 9));
  //   usernames.push('@....'.slice(0, 9)); // COMMENT OUT THIS TOO TO TEST 2-VS-3-PERSON VIEWS

  //   // Dummy second set of data
  //   var dummy = {total: 40, days: [7, 3, 22, 2, 0, 3, 3]};
  //   users.push(dummy.days);

  //   // Dummy third set of data!!! Comment out to compare 2-vs-3-person views!
  //   var dummy2 = {total: 45, days: [5, 3, 21, 2, 9, 2, 3]};
  //   users.push(dummy2.days);

  //   // Days of the week are used in the x-scaling and x-axis
  //   // We'll want to dynamically generate this from the data in the future
  //   var week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  //   // Declare counter variables that will be used throughout, using i = 0 in place of var i = 0 in loops
  //   var i, j;

  //   // Store each user's data for each day as a tuple of [id, commits]
  //   // The tuple is because we'll need to keep track of the id/user after we sort
  //   var data = [], sortedData, day, tuple;
  //   for (i = 0; i < 7; i++) {
  //     day = [];
  //     for (j = 0; j < users.length; j++) {
  //       tuple = [];
  //       tuple.push(j); // used as the index
  //       tuple.push(users[j][i]); // a specific user's # of commits on a specific day
  //       day.push(tuple); // the day array now has commit data for each of the users (for that day)
  //     }
  //     data.push(day); // data will have 7 'day' arrays, which will each have n 'tuples' where n = # of users
  //   }

  //   // Sort data so that for each day the users' tuples are sorted in descending order (most-commits-first)
  //   sortedData = JSON.parse(JSON.stringify(data)); // for some reason .slice seems to be changing original after sort
  //   for (i = 0; i < 7; i++) {
  //     sortedData[i].sort(function(a,b) { return a[1] < b[1]; });
  //   }

  //   // Find the most commits overall as well as the most commits per day
  //   var mostCommits = 0;
  //   var mostCommitsPerDay = [];

  //   for (i = 0; i < 7; i++) {
  //     var highest = 0, indexHighest = 0; // used for finding most commits for a particular day

  //     for (j = 0; j < users.length; j++) {
  //       if (data[i][j][1] > mostCommits) {
  //         mostCommits = data[i][j][1];
  //       }
  //       if (data[i][j][1] > highest) {
  //         highest = data[i][j][1];
  //         indexHighest = j;
  //       }
  //     }
  //     mostCommitsPerDay.push(indexHighest);
  //   }

  //   /*************
  //    Actual D3: the setup
  //   *************/

  //   // set dimensions
  //   var pad = 30;
  //   var w = 600 - 2*pad;
  //   var h = 360 - 2*pad;
  //   var barWidth = Math.floor(w/7) - 10;

  //   // create container / svg
  //   var svg = d3.select("#commit-charts")
  //     .append("svg")
  //       .attr("width", w)
  //       .attr("height", h);

  //   // set the scales
  //   var xScale = d3.scale.ordinal()
  //     .domain(week)
  //     .rangeRoundBands( [pad*2, w] );
  //   var yScale = d3.scale.linear()
  //     .domain(
  //       [mostCommits, 0])
  //     .range( [pad, h-pad*2] );

  //   // set the axes
  //   var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
  //   var yAxis = d3.svg.axis().scale(yScale).orient("left");

  //   // draw the axes (first is the x axis, second is the y axis)
  //   svg.append("g")
  //     .attr("class", "axis")
  //     .attr("transform", "translate(0, " + (h-2*pad) + ")")
  //     .style({
  //       fill: 'none',
  //       stroke: '#333'
  //     })
  //     .call(xAxis);
  //   svg.append("g")
  //     .attr("class", "axis")
  //     .attr("transform", "translate(" + (pad+10) + ", 0)")
  //     .style({
  //       fill: 'none',
  //       stroke: '#333'
  //     })
  //     .call(yAxis);

  //   /*************
  //    D3 continued: the part dealing with the data
  //   *************/

  //   // declare colors array, maximum 5.
  //   // Note that if there were only 5 olors, that would mean only up to 5 individuals could get compared.
  //   // THIS WILL GET UPDATED WHEN APP STYLING HAPPENS.
  //   var colors = [
  //     'lightgreen', 'steelblue', 'red'
  //   ];

  //   // add the bars in the bar graph
  //   var length = users.length;
  //   var skinnyBarWidth = barWidth/length;
  //   var whichData = length > 2 ? data : sortedData;

  //   var g = svg.selectAll(".bars")
  //     .data(whichData)
  //     .enter()
  //       .append("g")
  //   for (j = 0; j < users.length; j++) {
  //     g.append("rect")
  //       .attr('fill', (d) => {
  //         return colors[ d[j][0] ]
  //       })
  //       // .attr('opacity', (d) => {  // hard to see how 0.65 opacity is a good idea
  //       //   return j===0 ? 0.15 : 0.5  // (double the # of colors = confusing)
  //       // })
  //       .attr('x', (d, i) => {
  //         return length > 2 ? xScale(week[i]) + (j * skinnyBarWidth) : xScale(week[i])
  //        }) // i is being used as a d3 function param, not as a counter
  //       .attr('y', (d) => {
  //         return yScale(d[j][1])
  //        })
  //       .attr('width', () => {
  //         return length > 2 ? skinnyBarWidth : barWidth
  //        })
  //       .attr('height', (d) => {
  //         return yScale(0) - yScale(d[j][1])
  //       })
  //   }

  //   // add text labels for # of commits (when greater than 0)
  //   svg.append('g')
  //     .selectAll('text')
  //     .data(sortedData)
  //     .enter()
  //       .append('text')
  //       .attr('x', (d, i) => {
  //         return xScale(week[i]) + barWidth/2 + 4
  //       })
  //       .attr('y', (d) => {
  //         return yScale(d[0][1]) - 11
  //         // was formerly (for the 2-person-view) return d[0][1]===1 ? yScale(d[0][1]) - 5 : yScale(d[0][1]) + 15
  //       })
  //       .text((d) => {
  //         return d[0][1] > 0 ? d[0][1].toString() : ''
  //       });

  //   // add color dot indicators above the bars showing who won that day
  //   svg.append('g')
  //     .selectAll('circle')
  //     .data(sortedData)
  //     .enter()
  //       .append('circle')
  //       .attr('cx', (d, i) => {
  //         return xScale(week[i]) + barWidth/2 - 7;
  //       })
  //       .attr('cy', (d) => {
  //         return yScale(d[0][1]) - 15
  //       })
  //       .attr('fill', (d) => {
  //         return colors[ d[0][0] ]
  //       })
  //       .attr('r', 5)
  //       .attr('stroke', 'black');

  //   // add a legend associating usernames with colors on the graph
  //   for (j = 0; j < users.length; j++) {
  //     svg.append('rect')
  //       .attr('fill', () => colors[j])
  //       .attr('x', 50 + 100 * j)
  //       .attr('y', h - pad + 15)
  //       .attr('width', 8)
  //       .attr('height', 8);
  //     svg.append('text')
  //       .attr('transform', 'translate(' + (60 + 100 * j) + ',' + (h - 7) + ')')
  //       .text(() => usernames[j]);
  //   }

  // });
};
