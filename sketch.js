// defining variables
let data = [];
let data2 = [];
let index = [];
let countryData, percentageData, typeData, yearData, totalData;
let values = [];
let states = [];
let bubbleSortValues = [];
let bubbleStates = [];
let speedSlider;


/**
 * Loads dataset for the map
 */
function preload() {
  dataset = loadTable("Employment.csv", "csv", "header");
}

function bubbleSortWithIndicesVisual(arr) {
  const indices = Array.from({ length: arr.length }, (_, i) => i);
  bubbleSortValues = arr.slice(); // Copy values for bubble sort visualization
  bubbleStates = Array(arr.length).fill(-1);
  return indices;
}


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

  for (const index of indexArray) {
    sortedArray.push(array[index]);
  }

  return sortedArray;
}



// Binary Search Function to find the country from the dataset for efficiency. 
function binarySearch(arr, target, key) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid][key] === target) {
      return mid;
    } else if (arr[mid][key] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

// Function to create input and search button
function createSearchInput() {
  const input = createInput();
  input.position(800, 680);
  input.attribute("placeholder", "Enter country");

  const searchButton = createButton("Binary Search Country");
  searchButton.position(input.x + input.width + 10, 680);
  searchButton.mousePressed(() => {
    const country = input.value();
    const resultIndex = binarySearch(data, country, "name"); // assuming 'name' is the key for country names
    if (resultIndex !== -1) {
      alert(`Male: ${data[resultIndex].values[0]} | Female: ${data[resultIndex].values[1]} ` );
    } else {
      alert("Country not found.");
    }
  });
}


function createButtons() {
  createSearchInput(); // Add this line to create input and button for search
  const bubbleSortButton = createButton("Sort Ascending (Bubble Sort)");
  bubbleSortButton.position(800, 600);
  bubbleSortButton.mousePressed(async () => {
    let sortedIndices = await bubbleSortWithIndices(totalValues);
    console.log(sortedIndices)
    // data = sortArrayByIndex(data, sortedIndices);
    console.log(sortArrayByIndex(data, sortedIndices));

    d3RadialChart(sortArrayByIndex(data, sortedIndices));
  });

  const descButton = createButton("Sort Ascending (Quick Sort)");
  descButton.position(800, 640);
  descButton.mousePressed(() => {
    let sortedIndices = quickSortWithIndices(totalValues);
    // data = sortArrayByIndex(data, sortedIndices);
    d3RadialChart(sortArrayByIndex(data, sortedIndices)); // Redraw the chart
  });

  const animatedSort = createButton("Start Sorting (Bubble Sort & Quick Sort simultaneously)");
  animatedSort.position(800, 300);
  animatedSort.mousePressed(async () => {
    const startTime = performance.now(); // Start time
    quickSortWithVisual(0, totalValues.length - 1);

    const endTime = performance.now(); // End time
    const timeTaken = endTime - startTime; // Calculate time taken
  
    console.log(`Bubble Sort with Indices took ${timeTaken.toFixed(2)} milliseconds.`);
  
    let sortedIndices = await bubbleSortWithIndicesVisual(totalValues);
    data2 = sortArrayByIndex(data, totalValues);
    simulateSorting();
    bubbleSortVisual(bubbleSortValues);
    

    loop(); // Start the p5.js draw loop
  });
}

function createSliders() {
  speedSlider = createSlider(1, 1000, 25); // Create slider to control animation speed
  speedSlider.position(800, 340);
}


async function bubbleSortVisual(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        await swapWithVisual(arr, j, j + 1, bubbleStates);
      }
    }
  }
}

async function swapWithVisual(arr, i, j, stateArray) {
  let speed = 1000 - speedSlider.value(); // Invert the slider value to make the animation faster with higher values
  await sleep(speed);
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  stateArray[i] = 1;
  stateArray[j] = 1;
  await sleep(speed);
  stateArray[i] = -1;
  stateArray[j] = -1;
}

async function quickSortWithVisual(start, end) {
  if (start > end) {
    return;
  }
  let index = await partitionWithVisual(start, end);
  states[index] = -1;
  await Promise.all(
    [quickSortWithVisual(start, index - 1), 
     quickSortWithVisual(index + 1, end)
    ]);
}

async function partitionWithVisual(start, end) {
  for (let i = start; i < end; i++) {
    states[i] = 1;
  }
  let pivotIndex = start;
  states[pivotIndex] = 0;
  let pivotElement = values[end];
  for (let i = start; i < end; i++) {
    if (values[i] < pivotElement) {
      await swapWithVisual(values, i, pivotIndex, states);
      states[pivotIndex] = -1;
      pivotIndex++;
      states[pivotIndex] = 0;
    }
  }
  await swapWithVisual(values, end, pivotIndex, states);
  for (let i = start; i < end; i++) {
    if (i != pivotIndex) {
      states[i] = -1;
    }
  }
  return pivotIndex;
}

function simulateSorting() {
  // Simulate sorting animations
  loop();
}

function visualizeSorting(values, states, visualizationType) {
  try {
    const barWidth = 4;
    const yOffset = visualizationType === "BubbleSort" ? height / 2 : 0; // Set yOffset for Bubble Sort
    for (let k = 0; k < values.length; k++) {
      stroke(255);
      if (states[k] === 1) {
        fill("#ff7f0e"); // Highlight swapped bars
      } else if (states[k] === 0) {
        fill("#1f77b4"); // Highlight pivot
      } else {
        fill(237, 129, 156); // Normal bars
      }
      rect(k * barWidth, yOffset + (height / 2.5 ), barWidth, -values[k]); // Adjusted yOffset for positioning
    }
  } catch (error) {
    console.error("Error in visualizeSorting:", error);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// p5.js setup
function setup() {
  createCanvas(800, 300);
  countryData = dataset.getColumn(1).slice(901);
  typeData = dataset.getColumn(3).slice(901);
  percentageData = dataset.getColumn(4).slice(901);
  yearData = dataset.getColumn(2).slice(901);
  totalData = dataset.getColumn(5).slice(901); // Index for total percentages

  // Using linear search because you need to go through the data once to find the values and put them into the new array
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
        countryEntry.values[0] = parseFloat(percentageData[i]) || 0; // Female Percentage
        countryEntry.total += parseFloat(percentageData[i]);
      } else if (typeData[i] === "Employment by industry: Agriculture (%) Male") {
        countryEntry.values[1] = parseFloat(percentageData[i]) || 0; // Male Percentage
        countryEntry.total += parseFloat(percentageData[i]);
      }
    }
  }


    serviceData = dataset.getColumn(4).slice(901); // Assuming column 6 has service data
  
    // Process the data
    for (let i = 0; i < countryData.length; i++) {
      if (yearData[i] === "2021") {
        const countryName = countryData[i];
        let total = 0;
        let countryEntry = data.find((entry) => entry.name === countryName);
        if (!countryEntry) {
          countryEntry = { name: countryName, values: [null, null], total, service: 0 };
          data.push(countryEntry);
          index.push(i);
        }
  
        // Assign the appropriate value and update countryEntry.total
        if (typeData[i] === "Employment by industry: Service (%)") {
          countryEntry.service = parseFloat(serviceData[i]) || 0; // Service Percentage
          countryEntry.total += parseFloat(serviceData[i]);
        }
      }
    }
  
    totalValues = data.map((item) => item.service);
    createButtons(); // Add buttons for sorting
    createSliders(); // Add sliders for controlling speed
    noLoop(); // Prevent p5.js from looping
    d3RadialChart(data); // Call the D3.js radial chart function
    
    values = totalValues.slice(); // Copy the totalValues for visualization
    for(let i = 0; i < values.length; i++) {
      states.push(-1);
    }
    

  totalValues = data.map((item) => item.total);
  createButtons(); // Add buttons for sorting
  createSliders(); // Add sliders for controlling speed
  noLoop(); // Prevent p5.js from looping
  d3RadialChart(data); // Call the D3.js radial chart function
  
  values = totalValues.slice(); // Copy the totalValues for visualization
  for(let i = 0; i < values.length; i++) {
    states.push(-1);
  }
}

function draw() {
  background(255);

  visualizeSorting(values, states, "QuickSort");
  visualizeSorting(bubbleSortValues, bubbleStates, "BubbleSort");
}


// D3.js radial chart function

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

        return `translate(${xCoord}, ${yCoord+30}) rotate(${angle})`;
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
          .attr("dy", "-5em")
          .text("Agriculture Employment Percentage")
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
        g
          .append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", color)
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