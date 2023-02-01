(() => {
	var change_type = document.getElementsByClassName('change-kind');			//SSD|HDD toggle
	var change_subscribe = document.getElementsByClassName('change-subscribe');		//Multi|Single toggle
	var storage_range = document.getElementById('storage');					//storage slider
	var transfer_range = document.getElementById('transfer');				//transfer slider
	var storage_lable = document.getElementById('storage-value');				//storage amount text
	var transfer_lable = document.getElementById('transfer-value');				//transfer amount text
	var area = document.getElementById('chart-area');															//graphics area

	var chart_rows = document.getElementsByClassName('chart-rows');				//chart lines
	var cost_labels = document.getElementsByClassName('chart-rows-text');			//cost text in graphics area

	var storage = storage_range.value;
	var transfer = transfer_range.value;

	const COLORS = [
		`#FF0000`,
		`#FFA500`,
		`#800080`,
		`#0000FF`
	];

	storage_lable.textContent = storage_range.value;
	transfer_lable.textContent = transfer_range.value;

	const MAX_PERCENTAGE = 100; //maximum percentage of chart bar height relative to graphics area

	const MAX_GB = 1000; //maximum amount of storage and transfer

	for (var item of chart_rows) {
		item.style.setProperty('--color', '#808080');
	}


	class hostings {
		constructor (cost_storage, cost_transfer, min_pay, max_pay, free_storage, free_transfer, additional_options) {
			this.cost_storage = cost_storage; //cost of 1gb storage. This is array of costs depending on additional services on the host
			this.cost_transfer = cost_transfer; //cost of 1gb transfer. This is array of costs depending on additional services on the host
			this.min_pay = min_pay; //minimal amount of donation
			this.max_pay = max_pay; //maximal amount of donation
			this.free_storage = free_storage; //the amount of storage in GB that is provided for free
			this.free_transfer = free_transfer; //the amount of transfer in GB that is provided for free
			this.additional_options = additional_options; //additional services that provided on the host like as (SSD|HDD). This is array of 2 values. The first one means used second element in array cost_storage. The second one means used second element in array cost_transfer
		}
	}

	var backblaze = new hostings([0.005, 0], [0.01, 0], 7, 0, 0, 0, [false, false]);
	var bunny = new hostings([0.01, 0.02], [0.01, 0], -1, 10, 0, 0, [false, false]);
	var scaleway = new hostings([0.06, 0.03], [0.02, 0], 0, 0, 75, 75, [false, false]);
	var vultr = new hostings([0.01, 0], [0.01, 0], 5, 0, 0, 0, [false, false]);

	let objects = [backblaze, bunny, scaleway, vultr];

	//maximal cost depending on the hosts
	const MAX_COST = Math.max( Math.max(...backblaze.cost_storage)*(MAX_GB-backblaze.free_storage)+Math.max(...backblaze.cost_transfer)*(MAX_GB-backblaze.free_transfer), Math.max(...bunny.cost_storage)*(MAX_GB-bunny.free_storage)+Math.max(...bunny.cost_transfer)*(MAX_GB-bunny.free_transfer), 
		Math.max(...scaleway.cost_storage)*(MAX_GB-scaleway.free_storage)+Math.max(...scaleway.cost_transfer)*(MAX_GB-scaleway.free_transfer), Math.max(...vultr.cost_storage)*(MAX_GB-vultr.free_storage)+Math.max(...vultr.cost_transfer)*(MAX_GB-vultr.free_transfer));

	var MAX_WIDTH = (((area.offsetWidth-(String(MAX_COST.toFixed(0)).length*32))-10) / 100) * MAX_PERCENTAGE;

	//listener of changing storage slider
	storage_range.addEventListener("input", (event) => {
		storage_lable.textContent = event.target.value
		storage = event.target.value;
		calculate();
	})
	//listener of changing transfer slider
	transfer_range.addEventListener("input", (event) => {
		transfer_lable.textContent = event.target.value
		transfer = event.target.value;
		calculate();
	})
	//listener of changing window size
	window.addEventListener("resize", (event) => {
		MAX_WIDTH = (((area.offsetWidth-(String(MAX_COST.toFixed(0)).length*32))-10) / 100) * MAX_PERCENTAGE;
		calculate();
	});

	//set up the default setting of SSD|HDD toggle
	for (var i = 0; i < change_type.length; i++) {
    change_type[i].addEventListener('click', changeType);
    change_type[i].style.setProperty('--color','black');
    change_type[i].style.setProperty('--coloralt', 'rgba(130, 130, 130, 1)');
    change_type[i].style.setProperty('--font', 'bold');
    change_type[i].style.setProperty('--fontalt', 'normal');
  }
  //set up the default setting of Multi|Single toggle
  for (var i = 0; i < change_subscribe.length; i++) {
    change_subscribe[i].addEventListener('click', changeSubscribe);
    change_subscribe[i].style.setProperty('--color','black');
    change_subscribe[i].style.setProperty('--coloralt', 'rgba(130, 130, 130, 1)');
    change_subscribe[i].style.setProperty('--font', 'bold');
    change_subscribe[i].style.setProperty('--fontalt', 'normal');
  }
  calculate();

	function calculate() { //function for calculating costs depending on current chousen amount of storage and transfer, change chart lines size and set their colores
		let costs = new Array();
		var i = 0;
		for (var object of objects) {
			var cost = 0;
			if (object.free_storage >= storage) cost+=0;
			else if (object.additional_options[0] == true) cost += object.cost_storage[1] * (storage-object.free_storage);
			else cost += object.cost_storage[0] * (storage-object.free_storage);
			if (object.free_transfer >= transfer) cost+=0;
			else if (object.additional_options[1] == true) cost += object.cost_transfer[1] * (transfer-object.free_transfer);
			else cost += object.cost_transfer[0] * (transfer-object.free_transfer);
			let width = cost/MAX_COST*MAX_WIDTH;
			if (cost < object.min_pay) {
				width = object.min_pay/MAX_COST*MAX_WIDTH;
				cost = object.min_pay;
			}
			else if (cost > object.max_pay && object.max_pay != 0) {
				width = object.max_pay/MAX_COST*MAX_WIDTH;
				cost = object.max_pay;
			}
			chart_rows[i].style.setProperty('--width', width+"px");
			cost_labels[i].textContent = cost.toFixed(2) + "$";
			costs.push(cost);
			i++;
		}
		var index_min = costs.indexOf(Math.min(...costs));
		for (var item of chart_rows) item.style.setProperty('--color', '#808080');
		chart_rows[index_min].style.setProperty('--color', COLORS[index_min]);
		console.log(index_min);
	}
  function changeType() { //function for changing SSD|HDD toggle
  	for (var i = 0; i < change_type.length; i++) {
      if (objects[1].additional_options[0] == true) {
        change_type[i].style.setProperty('--color', 'black');
        change_type[i].style.setProperty('--coloralt', 'rgba(130, 130, 130, 1)');
        change_type[i].style.setProperty('--font', 'bold');
        change_type[i].style.setProperty('--fontalt', 'normal');
        objects[1].additional_options[0] = false;
        calculate();
      }
      else {
        change_type[i].style.setProperty('--color','rgba(130, 130, 130, 1)');
        change_type[i].style.setProperty('--coloralt', 'black');
        change_type[i].style.setProperty('--font', 'normal');
        change_type[i].style.setProperty('--fontalt', 'bold');
        objects[1].additional_options[0] = true;
        calculate();
      }
    }
  }
  function changeSubscribe() { //function for changing Multi|Single toggle
  	for (var i = 0; i < change_subscribe.length; i++) {
      if (objects[2].additional_options[0] == true) {
        change_subscribe[i].style.setProperty('--color', 'black');
        change_subscribe[i].style.setProperty('--coloralt', 'rgba(130, 130, 130, 1)');
        change_subscribe[i].style.setProperty('--font', 'bold');
        change_type[i].style.setProperty('--fontalt', 'normal');
        objects[2].additional_options[0] = false;
        calculate();
      }
      else {
        change_subscribe[i].style.setProperty('--color','rgba(130, 130, 130, 1)');
        change_subscribe[i].style.setProperty('--coloralt', 'black');
        change_subscribe[i].style.setProperty('--font', 'normal');
        change_subscribe[i].style.setProperty('--fontalt', 'bold');
        objects[2].additional_options[0] = true;
        calculate();
      }
    }
  }
})();
