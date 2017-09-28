let margin = { top: 50, bottom: 50, left: 50, right: 50 }
let width = 900 - margin.left - margin.right
let height = 750 - margin.top - margin.bottom

let projection = d3.geoMercator()
                    .fitSize([width, height], india)

let path = d3.geoPath().projection(projection)
let colorDomain = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4300]

let color =  d3.scaleLinear()
                .domain(colorDomain)
                .range(d3.schemeYlOrRd[9])

let active = d3.select(null)

let { features: states } = india

let heading = d3.select('body')
    .append('h2')
    .text('Rapes Reported in India 2015')

 d3.csv('india_crime.csv', (err, file) => {
    if (err) throw err

    let zoom = d3.zoom()
                .scaleExtent([1, 8])
                .on('zoom', zoomed)

    for(i=0; i< states.length; i++){
        for(j=0; j< file.length; j++){
            if (states[i].properties.ID_1 === +file[j].id) {
                states[i].properties.CASES = file[j].cases
                break;
            }
        }
    }

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

    let legend = d3.select('svg')
        .append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(500, 100)')
        .selectAll('g')
        .data(colorDomain)
        .enter()

    let legendColor = legend
        .append('rect')
        .attr('fill', d => color(d))
        .attr('x', (d, i) => i * 20)
        .attr('width', 20)
        .attr('height', 10)

    let legendText = legend
        .append('text')
        .attr('class', 'legend-text')
        .attr('x', (d, i) => i * 20)
        .attr('dy', '2.2em')
        .text((d, i) => i == 0 || i == 9 ? d : null)

    let tooltip = d3.select('body')
        .append('tooltip')
        .attr('class', 'tooltip')
        .style('opacity', '0')

    let map = svg
        .selectAll('path')
        .data(states)
        .enter()
        .append('path')
        .attr('fill', d => color(d.properties.CASES))
        .attr('d', path)
        .on('mouseover', d => {
            tooltip.transition()
                .duration(200)
                .style('opacity', 0.9)
            tooltip
                .html('<strong>' +
                        d.properties.NAME_1 +
                    '</strong>' +
                    '<br />' +
                        d.properties.CASES)
        })
        .on('mousemove', function(d){
                tooltip
                .style('left', (d3.mouse(this)[0]) + 'px')
                .style('top', (d3.mouse(this)[1]) + 'px')
        })
        .on('mouseout', d => {
            tooltip.transition()
                .duration(500)
                .style('opacity', 0)
          })
        .on('click', clicked)

    function clicked(d) {
        if (active.node() === this) return reset()
        active = d3.select(this).classed('active', true)
        let bounds = path.bounds(d)
            dx = bounds[1][0] - bounds[0][0],
            dy = bounds[1][1] - bounds[0][1],
            x = (bounds[0][0] + bounds[1][0]) / 2,
            y = (bounds[0][1] + bounds[1][1]) / 2,
            scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
            translate = [width / 2 - scale * x, height / 2 - scale * y]

        svg.transition()
        .delay(500)
        .duration(1000)
        .call(zoom.transform, transform(translate, scale))
    }

    function transform(coords, scale){
        return d3.zoomIdentity
            .translate(coords[0],coords[1])
            .scale(scale)
    }

    function zoomed() {
        svg.attr('transform', d3.event.transform)
    }

    function reset() {
      active.classed("active", false);
      active = d3.select(null);

      svg.transition()
          .duration(750)
          .call( zoom.transform, d3.zoomIdentity.translate(margin.left, margin.top) )
    }
})
