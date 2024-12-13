let data = [];
let index = [];
let countryData, percentageData, typeData, yearData, totalData;
let values = [];
let states = [];

/**
 * Loads dataset for the map
 */
function preload() {
  dataset = loadTable("Employment.csv", "csv", "header");
}

// Bubble sort to sort data in ascending order of total percentage
function bubbleSortWithIndices(arr) {
  const indices = Array.from({ length: arr.length }, (_, i) => i);

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[indices[j]] > arr[indices[j + 1]]) {
        // Swap indices
        [indices[j], indices[j + 1]] = [indices[j + 1], indices[j]];
      }
    }
  }

  return indices;
}

const swap = (arr, leftIndex, rightIndex) => {
  let temp = arr[leftIndex];
  arr[leftIndex] = arr[rightIndex];
  arr[rightIndex] = temp;
};

const partition = (arr, indices, left, right) => {
  let pivot = arr[Math.floor((right + left) / 2)];
  let i = left;
  let j = right;
  while (i <= j) {
    while (arr[i] < pivot) {
      i++;
    }
    while (arr[j] > pivot) {
      j--;
    }
    if (i <= j) {
      swap(arr, i, j); // Swap elements in the array
      swap(indices, i, j); // Swap corresponding indices
      i++;
      j--;
    }
  }
  return i;
};

const quickSortWithIndices = (arr, left = 0, right = arr.length - 1, indices = arr.map((_, i) => i)) => {
  let index;
  if (arr.length > 1) {
    index = partition(arr, indices, left, right);
    if (left < index - 1) {
      quickSortWithIndices(arr, left, index - 1, indices);
    }
    if (index < right) {
      quickSortWithIndices(arr, index, right, indices);
    }
  }
  return indices;
};

function sortArrayByIndex(array, indexArray) {
  const sortedArray = [];

  // Iterate through the index array
  for (const index of indexArray) {
    // Get the element at the specified index from the original array
    sortedArray.push(array[index]);
  }

  return sortedArray;
}

// p5.js setup
function setup() {
  createCanvas(800, 600);
  countryData = dataset.getColumn(1).slice(901);
  typeData = dataset.getColumn(3).slice(901);
  percentageData = dataset.getColumn(4).slice(901);
  yearData = dataset.getColumn(2).slice(901);
  totalData = dataset.getColumn(5).slice(901); // Index for total percentages

  // Process the data
  for (let i = 0; i < countryData.length; i++) {
    if (yearData[i] === "2021") {
      const countryName = countryData[i];
      let total = 0;
      // Find or create country entry
      let countryEntry = data.find((entry) => entry.name === countryName);
      if (!countryEntry) {
        countryEntry = { name: countryName, values: [null, null], total };
        data.push(countryEntry);
        index.push(i);
      }

      // Assign the appropriate value and update countryEntry.total
      if (typeData[i] === "Employment by industry: Agriculture (%) Female") {
        countryEntry.values[0] = parseFloat(percentageData[i]) || 0; // Female Percentage
        countryEntry.total += parseFloat(percentageData[i]);
      } else if (typeData[i] === "Employment by industry: Agriculture (%) Male") {
        countryEntry.values[1] = parseFloat(percentageData[i]) || 0; // Male Percentage
        countryEntry.total += parseFloat(percentageData[i]);
      }
    }
  }

  totalValues = data.map((item) => item.total);
  createButtons(); // Add buttons for sorting
  noLoop(); // Prevent p5.js from looping
  d3RadialChart(data); // Call the D3.js radial chart function
  
  values = totalValues.slice(); // Copy the totalValues for visualization
  for(let i = 0; i < values.length; i++) {
    states.push(-1);
  }
  quickSortWithVisual(0, values.length - 1);
}

function createButtons() {
  const ascButton = createButton("Sort Ascending (Bubble Sort)");  
  ascButton.position(10, 10);
  ascButton.mousePressed(() => {
    let sortedIndices = bubbleSortWithIndices(totalValues);
    data = sortArrayByIndex(data, sortedIndices);
    d3RadialChart(data); // Redraw the chart
  });

  const descButton = createButton("Sort Descending (Not Implemented)");
  descButton.position(250, 10);
  descButton.mousePressed(() => {
    let sortedIndices = quickSortWithIndices(totalValues);
    data = sortArrayByIndex(data, sortedIndices);
    d3RadialChart(data); // Redraw the chart
  });
}

function d3RadialChart(data) {
    const width = 800;
    const height = 800;
    const innerRadius = 100;
    const outerRadius = 300;
  
    d3.select("body").select("svg").remove();
  
    // Define color scale with two categories (Female and Male)
    const color = d3
      .scaleOrdinal()
      .domain([0, 1]) // 0 for female, 1 for male
      .range(["#ff7f0e", "#1f77b4"]); // Female: Orange, Male: Blue
  
    // Create or update the SVG container
    const svg = d3
      .select("body")
      .selectAll("svg")
      .data([null])
      .join("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
  
    // Define x (angular) scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, 2 * Math.PI])
      .align(0);
  
    // Define y (radial) scale
    const y = d3
      .scaleRadial()
      .domain([0, d3.max(data, (d) => d3.sum(d.values))])
      .range([innerRadius, outerRadius]);
  
    // Stack the data based on keys
    const stack = d3
      .stack()
      .keys([0, 1]) // 0 for female, 1 for male
      .value((d, key) => d.values[key]);
  
    const series = stack(data);
  
    // Define the arc generator
    const arc = d3
      .arc()
      .innerRadius((d) => y(d[0]))
      .outerRadius((d) => y(d[1]))
      .startAngle((d) => x(d.data.name))
      .endAngle((d) => x(d.data.name) + x.bandwidth())
      .padAngle(0.01)
      .padRadius(innerRadius);
  
    // Draw the arcs
    svg
      .append("g")
      .selectAll("g")
      .data(series)
      .join("g")
      .attr("class", "series")
      .attr("fill", (d, i) => color(i)) // Assign color to each series (0: Female, 1: Male)
      .selectAll("path")
      .data((d) => d)
      .join("path")
      .attr("d", arc);
  
    // ... (rest of your D3 code)
  
    // Add x-axis (category labels)
    svg
      .append("g")
      .attr("text-anchor", "middle")
      .selectAll("g")
      .data(x.domain())
      .join("g")
      .attr("transform", (d) => {
        const angle = ((x(d) + x.bandwidth() / 2) * 180) / Math.PI - 90;
        const radius = outerRadius + 10; // Adjust radius as needed
  
        // Calculate x and y coordinates based on angle and radius
        const xCoord = radius * Math.cos((angle * Math.PI) / 180);
        const yCoord = radius * Math.sin((angle * Math.PI) / 180);
  
        return `translate(${xCoord}, ${yCoord}) rotate(${angle})`;
      })
      .call((g) => g.append("line").attr("x2", -5).attr("stroke", "#000"))
      .call((g) =>
        g
          .append("text")
          .attr("dy", "0.35em") // Adjust dy to fine-tune text position
          .text((d) => d)
      );
  
    // Add y-axis (radial ticks)
    svg
      .append("g")
      .attr("text-anchor", "middle")
      .call((g) =>
        g
          .append("text")
          .attr("y", (d) => -y(y.ticks(5).pop()))
          .attr("dy", "-1em")
          .text("Employment Percentage")
      )
      .call((g) =>
        g
          .selectAll("g")
          .data(y.ticks(5).slice(1))
          .join("g")
          .attr("fill", "none")
          .call((g) =>
            g
              .append("circle")
              .attr("stroke", "#000")
              .attr("stroke-opacity", 0.5)
              .attr("r", y)
          )
          .call((g) =>
            g
              .append("text")
              .attr("y", (d) => -y(d))
              .attr("dy", "0.35em")
              .attr("stroke", "#fff")
              .attr("stroke-width", 5)
              .text(y.tickFormat(5, "s"))
              .clone(true)
              .attr("fill", "#000")
              .attr("stroke", "none")
          )
      );
  
    // Add legend
    svg
      .append("g")
      .selectAll("g")
      .data(color.domain())
      .join("g")
      .attr(
        "transform",
        (d, i, nodes) => `translate(-40, ${(nodes.length / 2 - i - 1) * 20})`
      )
      .call((g) =>
        g.append("rect").attr("width", 18).attr("height", 18).attr("fill", color)
      )
      .call((g) =>
        g
          .append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", "0.35em")
          .text((d) => (d === 0 ? "Female" : "Male"))
      );
  }
  
function draw() {
  background(140);
  for (let i = 0; i < values.length; i++) {
    // color coding
    if (states[i] == 0) {
      // color for the bar at the pivot index
      fill('#E0777D');
    } else if (states[i] == 1) {
      // color for the bars being sorted currently
      fill('#D6FFB7');
    } else {
      fill(255);
    }
    rect(i * 8, height - values[i], 8, values[i]);
  }
}

async function quickSortWithVisual(start, end) {
  if (start > end) {  // Nothing to sort!
    return;
  }
  // partition() returns the index of the pivot element.
  // Once partition() is executed, all elements to the  
  // left of the pivot element are smaller than it and 
  // all elements to its right are larger than it.
  let index = await partitionWithVisual(start, end);
  // restore original state
  states[index] = -1;
  await Promise.all(
    [quickSortWithVisual(start, index - 1), 
     quickSortWithVisual(index + 1, end)
    ]);
}

// We have chosen the element at the last index as 
// the pivot element, but we could've made different
// choices, e.g. take the first element as pivot.
async function partitionWithVisual(start, end) {
  for (let i = start; i < end; i++) {
    // identify the elements being considered currently
    states[i] = 1;
  }
  // Quicksort algorithm
  let pivotIndex = start;
  // make pivot index distinct
  states[pivotIndex] = 0;
  let pivotElement = values[end];
  for (let i = start; i < end; i++) {
    if (values[i] < pivotElement) {
      await swapWithVisual(i, pivotIndex);
      states[pivotIndex] = -1;
      pivotIndex++;
      states[pivotIndex] = 0;
    }
  }
  await swapWithVisual(end, pivotIndex);
  for (let i = start; i < end; i++) {
    // restore original state
    if (i != pivotIndex) {
      states[i] = -1;
    }
  }
  return pivotIndex;
}

// swaps elements of 'values' at indices 'i' and 'j'
async function swapWithVisual(i, j) {
  // adjust the pace of the simulation by changing the
  // value
  await sleep(25);
  let temp = values[i];
  values[i] = values[j];
  values[j] = temp;
}

// custom helper function to deliberately slow down
// the sorting process and make visualization easy
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
















let data = [];
let index = [];
let countryData, percentageData, typeData, yearData, totalData;
let values = [];
let states = [];
let sorting = false; // Flag to control sorting
let bubbleValues = [];
let i = 0;
let j = 0;

/**
 * Loads dataset for the map
 */
function preload() {
  dataset = loadTable("Employment.csv", "csv", "header");
}

function setup() {
  createCanvas(1500, 200);
  countryData = dataset.getColumn(1).slice(901);
  typeData = dataset.getColumn(3).slice(901);
  percentageData = dataset.getColumn(4).slice(901);
  yearData = dataset.getColumn(2).slice(901);
  totalData = dataset.getColumn(5).slice(901); // Index for total percentages

  // Process the data
  for (let i = 0; i < countryData.length; i++) {
    if (yearData[i] === "2021") {
      const countryName = countryData[i];
      let total = 0;
      let countryEntry = data.find((entry) => entry.name === countryName);
      if (!countryEntry) {
        countryEntry = { name: countryName, values: [null, null], total };
        data.push(countryEntry);
        index.push(i);
      }

      if (typeData[i] === "Employment by industry: Agriculture (%) Female") {
        countryEntry.values[0] = parseFloat(percentageData[i]) || 0;
        countryEntry.total += parseFloat(percentageData[i]);
      } else if (
        typeData[i] === "Employment by industry: Agriculture (%) Male"
      ) {
        countryEntry.values[1] = parseFloat(percentageData[i]) || 0;
        countryEntry.total += parseFloat(percentageData[i]);
      }
    }
  }

  totalValues = data.map((item) => item.total);
  createButtons();
  noLoop(); // Prevent p5.js from looping initially

  values = totalValues.slice();
  states = Array(values.length).fill(-1); // Initialize states for visualization
}

function createButtons() {
  const bubbleSortButton = createButton("Sort Ascending (Bubble Sort)");
  bubbleSortButton.position(10, 10);
  bubbleSortButton.mousePressed(() => {
    if (!sorting) {
      sorting = true; // Enable sorting
      i = 0; // Reset sorting indices
      j = 0;
      states.fill(-1); // Reset states
      loop(); // Start draw loop
    }
  });
}

function draw() {
  background(140);

  if (sorting) {
    bubbleSortStep(); // Execute a step of the Bubble Sort
  }

  simulateSorting(); // Draw the array visualization
}

function bubbleSortStep() {
  for (let k = 0; k < 8; k++) { // Perform multiple swaps per frame for smoother animation
    if (i < values.length) {
      if (j < values.length - i - 1) {
        if (values[j] > values[j + 1]) {
          // Swap values
          let temp = values[j];
          values[j] = values[j + 1];
          values[j + 1] = temp;

          // Mark as currently swapped
          states[j] = 1;
          states[j + 1] = 1;
        }
        j++;
      } else {
        j = 0;
        i++;
      }
    } else {
      sorting = false; // Stop sorting
      noLoop(); // Stop the draw loop
    }
  }

  // Reset the states of bars not being compared
  for (let k = 0; k < values.length; k++) {
    if (states[k] !== 1) {
      states[k] = -1;
    }
  }
}

// Visualize the array as rectangles
function simulateSorting() {
  for (let k = 0; k < values.length; k++) {
    stroke(255);
    if (states[k] === 1) {
      fill("#ff7f0e"); // Highlight swapped bars
    } else {
      fill(237, 129, 156); // Normal bars
    }
    rect(k * 8, height, 8, -values[k]); // Adjust bar width and spacing
  }
}