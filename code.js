let margin = { top: 50, bottom: 50, left: 50, right: 50 }
let width = 900 - margin.left - margin.right
let height = 750 - margin.top - margin.bottom

let projection = d3.geoMercator()
                    .fitSize([width, height], india)

let path = d3.geoPath().projection(projection)

let color = ({ properties }) => d3.scaleLinear()
                                .domain([0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4300])
                                .range(d3.schemeYlOrRd[9])(properties.CASES)

let { features: states } = india


 d3.csv('india_crime.csv', (err, file) => {
    if (err) throw err

    for(i=0; i< states.length; i++){
        for(j=0; j< file.length; j++){
            if (states[i].properties.ID_1 === +file[j].id) {
                states[i].properties.CASES = file[j].cases
                break;
            }
        }
    }

    let heading = d3.select('body')
        .append('h2')
        .text('Rapes Reported in India')

    let svg = d3.select('body')
        .append('svg')
        .attr('class', 'svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('class', 'map')
        .attr('fill', 'white')
        .attr('stroke', 'white')
        .attr('stroke-width', '0.2')

    let div = d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('opacity', '0')

    let map = svg
        .selectAll('path')
        .data(states)
        .enter()
        .append('path')
        .attr('fill', color)
        .attr('d', path)
        .on('mouseover', d => {
            div.transition()
                .duration(200)
                .style('opacity', 0.9)
            div
                .html('<strong>' +
                        d.properties.NAME_1 +
                    '</strong>' +
                    '<br />' +
                        d.properties.CASES)
        })
        .on('mousemove', function(d){
                div
                .style('left', (d3.mouse(this)[0] - 10) + 'px')
                .style('top', (d3.mouse(this)[1] - 10) + 'px')
        })
        .on('mouseout', d => {
            div.transition()
                .duration(500)
                .style('opacity', 0)
          })
})
