import { Component,OnInit } from '@angular/core';
import { loadModules } from 'esri-loader';
import { saveAs } from 'file-saver';
// import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  view: any;
  isButtonVisible: boolean = false;
  boundaries: any;
  graphicsLayer:any;
  getGrouped:any;
  graphic:any;
  fillSymbol:any;
  checked:boolean=true;
  selectedBoundary: any[] = [];
  groupButtonVisible:boolean = false;
  groupedBoundaries:any;
  geoJSONLayer:any;
  getlayer: any[] = [];
  boundaryGroup:any[] = [];
  result: any;
  constructor(){}
  title = 'mapview2';

  ngOnInit(): void {

    loadModules([
      'esri/Map',
      'esri/views/SceneView',
      'esri/layers/GraphicsLayer',
      'esri/Graphic',
      "esri/symbols/SimpleFillSymbol",
      "esri/Color",
      "esri/symbols/Symbol"
    ]).then(([Map,SceneView,GraphicsLayer,Graphic,SimpleFillSymbol,Color,Symbol]) => {
      // Create a new Map instance
      const map = new Map({
        basemap: 'streets',
      
      });

      // Create a new scene view
      this.view = new SceneView({
        container: 'mapView',
        map: map,
        // center: [-122.4194, 37.7749], // Specify the initial center of the map
        // zoom: 12 // Specify the initial zoom level

       
      });

      this.graphic = new Graphic()
      this.graphicsLayer = new GraphicsLayer();  
     
      this.fillSymbol = new SimpleFillSymbol({
        color: new Color({
          r: Math.floor(Math.random() * 256),
          g: Math.floor(Math.random() * 256),
          b: Math.floor(Math.random() * 256),
          a: 1  // Alpha value (opacity)
        }) // Red color with 50% transparency
      });
    
    this.view.map.add(this.graphicsLayer);
  
    this.view.on('click', (event:any) => {
        this.view.hitTest(event.screenPoint).then((response:any) => {
          const results = response.results;
          if (results.length > 0) 
          {
            const feature = results[0].graphic;
            const id = feature.attributes.__OBJECTID;
            // const graphic = this.graphicsLayer.graphics.find((g: any) => g.attributes.id === group.properties.id);
            
            if(this.boundaries)
            {    
              for(let Groups of this.boundaries.ClusteringGroup)
              {          

                   let Boundaries = Groups.Boundaries

                   Boundaries.forEach((boundary:any)=>{

                    if(boundary.properties.id == id)
                    {                  
                      this.getlayer =  this.getBoundaryCoordinates(boundary)
  
                      if(this.getlayer.length == 0)
                       {
                         this.groupButtonVisible = false 
                        }
                    }

                   })
                            

              }

            
              
            }
           
          
          }
        });
     
    });


})
  

  }
  
  getGeoJson(event: any): void {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
     
      const geoJson = JSON.parse(e.target.result);
      const uniqueIdField = 'id';
      const group = 'group'
      const fillcolor = "fillcolor"

      geoJson.features.forEach((feature: any, index: number) => {
        feature.properties[uniqueIdField] = index + 1;
        feature.properties[group] = 'Group'+`${index+ 1}`;
        if(feature.properties.group == 'Group1')
        {
          feature.properties[fillcolor] = "red"
          
        }
        if(feature.properties.group == 'Group2'){
          feature.properties[fillcolor] = "blue"
        }
        if(feature.properties.group == 'Group3'){
          feature.properties[fillcolor] = "green"
        }
        if(feature.properties.group == 'Group4'){
          feature.properties[fillcolor] = "black"
        }if(feature.properties.group == 'Group5'){
          feature.properties[fillcolor] = "aqua"
        }


      }); 


      
      let ClusteringGroup:any[] = []
      let i =1
      let groupId = 1
      geoJson.features.forEach((boundary:any)=>
      {
        ClusteringGroup.push(
            { 
              GroupId : groupId++,
              GroupName: 'Group'+`${i++}`,
              Boundaries: [boundary]
            }
         )
      })

      this.boundaries = { ClusteringGroup : ClusteringGroup } 
           
      console.log(this.boundaries)
      
        loadModules(['esri/layers/GeoJSONLayer',
        'esri/renderers/SimpleRenderer',
        'esri/symbols/SimpleFillSymbol',
        'esri/Color',
        'esri/renderers/UniqueValueRenderer',
      ]).then(([GeoJSONLayer,SimpleRenderer,SimpleFillSymbol,Color,UniqueValueRenderer]) => {
         
          

          this.geoJSONLayer = new GeoJSONLayer({
            title: 'Grouped Boundaries',
            url: URL.createObjectURL(file),
            renderer:new UniqueValueRenderer({
              field: 'group', // Replace with the field that represents the group in your GeoJSON properties
              defaultSymbol: new SimpleFillSymbol({
                color: [169, 169, 169, 0.5] // Set the default color for ungrouped boundaries
              }),
              
              uniqueValueInfos: [
                {
             
                  value: 'Group1', // Replace with the value that represents Group1 in your GeoJSON properties
                  symbol: new SimpleFillSymbol({
                    color: 'red' // Set the color for Group1 boundaries
                  })
                },
                {
                  value: 'Group2', // Replace with the value that represents Group2 in your GeoJSON properties
                  symbol: new SimpleFillSymbol({
                    color: 'blue' // Set the color for Group2 boundaries
                  })
                },{
                  value: 'Group3', // Replace with the value that represents Group2 in your GeoJSON properties
                  symbol: new SimpleFillSymbol({
                    color: 'aqua' // Set the color for Group2 boundaries
                  })
                },{
                  value: 'Group4', // Replace with the value that represents Group2 in your GeoJSON properties
                  symbol: new SimpleFillSymbol({
                    color: 'black' // Set the color for Group2 boundaries
                  })
                },

                // Add more unique value infos for additional groups if needed
              ]
            }) 

          });


          // this.graphicsLayer.add()

          this.view.map.add(this.geoJSONLayer);
          
          this.isButtonVisible = true;  


        });
       
      };
      reader.readAsText(file);
    }
  }

  getGroup(boundaries:any)
  {
     return boundaries;
  }


  getBoundaryCoordinates(layer:any ) 
  {
    layer.visible = !layer.visible

    if (layer && layer.type == 'Feature') 
    {  
      const geometry = layer.geometry;
      if (geometry.type == 'Polygon') {
        const coordinates = geometry.coordinates[0];
        const polygon = {
          type: "polygon",
          rings: [coordinates]
        };

        this.graphic = 
        {
            geometry: polygon,
            symbol: {
              type: 'simple-fill',
              outline: {
                color: [255, 0, 0, 1],
                width: 2
              }
            },
            attributes:
            {
              id : layer.properties.id
            }    
        }   
      }   
    if (layer.visible == true) 
      {   
        this.graphicsLayer.add(this.graphic);   
        this.selectedBoundary.push(layer)
        this.groupButtonVisible = true 

 
      }
    else if(layer.visible == false)
    {
     
        const graphic = this.graphicsLayer.graphics.find((g: any) => g.attributes.id === layer.properties.id);
        this.graphicsLayer.remove(graphic);
        this.selectedBoundary.pop() 

    }  
    }

    return this.selectedBoundary
  }





onButtonGroup()
{

    this.groupedBoundaries = this.groupBoundariesByCondition();   
    this.updateBoundary(this.groupedBoundaries)
    loadModules(['esri/geometry/geometryEngine']).then(([geometryEngine]) => 
    {
        this.groupedBoundaries.forEach((group: any) => {
      
        let geometries = group.features.map((feature: any) => feature.geometry);
        let Groupcolor = group.features.map((feature: any) => feature.properties.fillcolor);
        let graphicId = group.features.map((feature: any) => feature.properties.id);
      
        for(const geo of geometries)
        {
          if (geo.type == 'Polygon') {
            const coordinates = geo.coordinates[0];
            const polygon = {
              type: "polygon",
              rings: [coordinates]
            };
      
            for(const id of graphicId)
            {

            this.graphic = {
              geometry: polygon,
              symbol:{
                type: 'simple-fill',
                color: Groupcolor[0],
                outline: {
                color: Groupcolor[0],
                width: 1
              },
              
            }, attributes:
            {
              id : id
            } 
           
            };
            this.graphicsLayer.add(this.graphic);
            this.groupButtonVisible = false;  
          }        
            
          }

        }

        // const geojson = {
        //   type: 'FeatureCollection',
        //   features: group.features // Replace 'groupedData' with the actual grouped data array
        // };

        // const blob = new Blob([JSON.stringify(geojson)], { type: 'application/json' }); 
        // saveAs(blob, 'grouped_data.geojson');


      }); 

    this.selectedBoundary = []

    });

  
    
  }



  groupBoundariesByCondition(): any[] 
  {    
    let groupedBoundaries: any[] = [];
    const groupedValues: Set<string> = new Set();

    var groupId = this.selectedBoundary[0].properties.group
    let fillColor = this.selectedBoundary[0].properties.fillcolor
    this.selectedBoundary.forEach((boundary: any) => {
      const groupKey = boundary.properties.groupAttribute;  
      if(groupKey != groupId)
      {
        this.removeBoundary(boundary);      
      }
      boundary.properties.group = groupId
      boundary.properties.fillcolor = fillColor    
      if (groupedValues.has(groupKey)) 
      {
        const existingGroup = groupedBoundaries.find((group: any) => group.key === groupKey);
        existingGroup.features.push(boundary);
      }
      else 
      {
        groupedValues.add(groupKey);      
        groupedBoundaries.push({
          features: [boundary],
        });   

        
        
      }  
      
     
    });
    return groupedBoundaries; 
  }

  
 removeBoundary(boundary:any)
 {
  
  var groupIndex = this.getGroupIndex(boundary)
  var BoundaryIndex = this.getBoundaryIndex(boundary)
  this.boundaries.ClusteringGroup[groupIndex].Boundaries.splice(BoundaryIndex,1)
  if(this.boundaries.ClusteringGroup[groupIndex].Boundaries.length == 0)
   {
    this.boundaries.ClusteringGroup.splice(groupIndex,1)
   }

 }


getGroupIndex(boundary:any){
  let Groups = this.boundaries.ClusteringGroup
  let index:any; 
  Groups.forEach((group:any,i:number)=>{
         group.Boundaries.forEach((bound:any)=>{       
             if(bound.properties.id == boundary.properties.id)
             {               
                index = i
             }
         })  
  })

  return index  
 }

getBoundaryIndex(boundary:any)
{
  let Groups = this.boundaries.ClusteringGroup
  let index:any
  Groups.forEach((group:any)=>{
       group.Boundaries.forEach((bound:any,i:number)=>{
           if(bound.properties.id == boundary.properties.id)
           {
            index = i
           }    
             
       })
  })

  return index
}

generateRandomColor() {
  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
  return randomColor;
}

updateBoundary(Gboundary:any){
  
  const randomColor = this.generateRandomColor();
  let Duplicate:any = [];
  

  var boundariesCollection = this.addGroupinToCollection()
  let i = boundariesCollection.length + 1
  var newgroup = {
    GroupId : i++,
    GroupName : 'Group'+`${i++}`,
    Boundaries: Gboundary[0].features
    
  }

  let newArray:any = [];

  boundariesCollection.forEach((obj:any) => {
    const index = newArray.findIndex((item:any) => item.GroupName === obj.GroupName); 
    if (index === -1) {
      newArray.push(obj);
    } else {

      Duplicate.push(obj)
      if(Duplicate.GroupId == newgroup.GroupId && Duplicate.GroupName == newgroup.GroupName )
      {
          i++
          newgroup.GroupId = i
          newgroup.GroupName = 'Group'+`${i}`
          newArray.push(newgroup);
      }
      else{
        newArray.push(newgroup);
      }
     
    }
  });

  
  boundariesCollection = newArray;
  for(let group of Gboundary[0].features){
  for(let  bound of boundariesCollection){  
        if( bound.GroupName == newgroup.GroupName){
               group.properties.group = newgroup.GroupName
               group.properties.fillcolor = randomColor
         }
   }
 }
  this.boundaries.ClusteringGroup = boundariesCollection
  this.boundaries.ClusteringGroup.sort((a:any, b:any) => a.GroupId - b.GroupId );
  console.log(this.boundaries)
}


addGroupinToCollection()
{
 
  if(this.boundaries.ClusteringGroup){
    let groupshape ={
      GroupId:this.groupedBoundaries[0].features[0].properties.id,
      GroupName:this.groupedBoundaries[0].features[0].properties.group,
      Boundaries:this.groupedBoundaries[0].features
    }

    this.boundaries.ClusteringGroup.push(groupshape)
    this.boundaries.ClusteringGroup.sort((a:any, b:any) => a.GroupId - b.GroupId);
  }

  

  return this.boundaries.ClusteringGroup

}

}


