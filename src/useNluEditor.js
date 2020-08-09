import React, {useState, useEffect} from 'react';
import localforage from 'localforage'
import useDBSingleKey from './useDBSingleKey'
import {uniquifyArray} from './utils'

function useNluEditor(database, databaseTable, databaseKey, updateLookups) {
    const {loadAll, saveItem, deleteItem , items, setItems, findKeyBy, filter} = useDBSingleKey(database, databaseTable, databaseKey)
    const [filteredItems, setFilteredItems] = useState([])
    const [filteredItemsKeys, setFilteredItemsKeys] = useState([])
    const [searchFilter, setSearchFilter] = useState('')
    const [tagAllValue, setTagAllValue] = useState('')
    const [skillAllValue, setSkillAllValue] = useState('')
    const [skillFilterValue, setSkillFilterValue] = useState('')
    const [intentFilterValue, setIntentFilterValue] = useState('')
    const [intentAllValue, setIntentAllValue] = useState('')
    const listRef = React.createRef()
    //const examplesDB = useDBSingleKey('nlutool','examples','alldata')
    //var updateLookupsTimeout = null
    //var updateFilteredTimeout = null
    //useEffect(() => {
        ////clearTimeout(updateLookupsTimeout)
        ////updateLookupsTimeout = setTimeout(function() {
            
        ////},2000)
    //// eslint-disable-next-line react-hooks/exhaustive-deps
    //},[items])
     
    useEffect(() => {
        //clearTimeout(updateFilteredTimeout)
        console.log('UPDATE FILTERED'+intentFilterValue)
        //updateFilteredTimeout = setTimeout(function() {
             //console.log('UPDATE FILTERED NOW')
             var filteredItems = filter(function(item) {
                if ((!searchFilter || searchFilter.trim().length <=0 ) && (!skillFilterValue || skillFilterValue.trim().length <=0 ) && (!intentFilterValue || intentFilterValue.trim().length <=0 )) return true;
                var intentFilter = true
                if (intentFilterValue && intentFilterValue.length > 0) {
                    if (item.intent === intentFilterValue) {
                        intentFilter = true
                    } else {
                        intentFilter = false
                    }
                }
                var skillFilter = true
                if (skillFilterValue && skillFilterValue.length > 0) {
                    if (item.skills && item.skills.indexOf(skillFilterValue) !== -1) {
                        skillFilter = true
                    } else {
                        skillFilter = false
                    }
                }
                var searchFilterBool = true
                if (searchFilter && searchFilter.length > 0) {
                    if (item.example && item.example.indexOf(searchFilter) !== -1 ) {
                        searchFilterBool = true
                    } else {
                        searchFilterBool = false
                    }
                }         
                return searchFilterBool && skillFilter && intentFilter;       
                //intentFilterValue
                //return (item.example.indexOf(searchFilter) !== -1 
                            //&& intentFilter 
                            //&& ((skillFilterValue.length <= 0 || (skillFilterValue.length > 0 && typeof item.skills ==="object" && item.skills.indexOf(skillFilterValue) !== -1)) ? true : false
            })
            var itemKeys = {}
            filteredItems.map(function(item) {if (item.id) itemKeys[item.id] = true; return null})
            filteredItems.sort(function(a,b) { return a.example < b.example ? true : false})
            setFilteredItems(filteredItems)
            setFilteredItemsKeys(itemKeys)
            updateLookups(filteredItems)
        //},800)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[items, searchFilter, skillFilterValue, intentFilterValue])
    
    function deleteAll(e)  {
        if (window.confirm('Really delete all selected examples')) {
                if (items) {
                var newItems = []
                items.map(function(item,i) {
                    if (item.id && filteredItemsKeys[item.id]) {
                       if (!item.isSelected) {
                           newItems.push(item)
                       }
                    } else {
                        newItems.push(item)
                    }
                    return null
                })
                setItems(newItems)
                listRef.current.resetAfterIndex(0);
            }
        }
         
    }
    
    function tagAll(val) {
        console.log(['tagall',tagAllValue,val])
        var tagValue = val ? val : tagAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
                
               if (item.isSelected && item.id && filteredItemsKeys[item.id]) {
                   var newItem = JSON.parse(JSON.stringify(item));
                   if (!newItem.tags) newItem.tags=[]
                   if (newItem.tags.indexOf(tagValue) === -1) newItem.tags.push(tagValue)
                   newItem.tags = uniquifyArray(newItem.tags)
                   newItems.push(newItem)
               } else {
                   newItems.push(item)
               }  
               return null
            })
            setItems(newItems)
        }
    }
    
    function intentAll(val) {
        console.log(['intentall',intentAllValue,val])
        var intentValue = val ? val : intentAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
                
               if (item.isSelected && item.id && filteredItemsKeys[item.id]) {
                   var newItem = item
                   newItem.intent = intentValue
                   newItems.push(newItem)
               } else {
                   newItems.push(item)
               }  
               return null
            })
            setItems(newItems)
        }
    }
    function resetSelection() {
         if (items) {
            var newItems = []
            items.map(function(item,i) {
               var newItem = item
               newItem.isSelected = false
               newItems.push(newItem)
               return null
            })
            setItems(newItems)
            
        }
    }
    
     function selectAll() {
         if (items) {
            var newItems = []
            items.map(function(item,i) {
                if (item.id && filteredItemsKeys[item.id]) {
                   var newItem = item
                   newItem.isSelected = true
                   newItems.push(newItem)
                } else {
                    newItem.isSelected = false
                    newItems.push(newItem)
                }
                return null
            })
            setItems(newItems)
        }
    }
    
     function skillSetAll(val) {
         console.log(['set skill all',tagAllValue,val])
        var skillValue = val ? val : skillAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
                
               if (item.isSelected && item.id && filteredItemsKeys[item.id]) {
                   var newItem = JSON.parse(JSON.stringify(item));
                   if (!newItem.skills) newItem.skills=[]
                   if (newItem.skills.indexOf(skillValue) === -1) newItem.skills.push(skillValue)
                   newItem.skills = uniquifyArray(newItem.skills)
                   newItems.push(newItem)
               } else {
                   newItems.push(item)
               }  
               return null
            })
            setItems(newItems)
        }
    }
    
       
    function saveAll(e)  {
        console.log(['save akk',filteredItems])
        if (items) {
            var newItems = []
            var lsItems = []
            filteredItems.map(function(item,i) {
                if (item.intent && item.intent.length > 0 && item.id && filteredItemsKeys[item.id]) {
                   if (item.isSelected) {
                       lsItems.push(item)
                   } else {
                       newItems.push(item)
                   }
                } else {
                    newItems.push(item)
               }
               return null
            })
            saveLSItems(lsItems)
            setItems(newItems)
            listRef.current.resetAfterIndex(0);
        }
         
    }
   
    function createEmptyItem(skill, intent) {
        setSearchFilter('')
        var skills=[]
        if (skill && skill.trim().length > 0) skills.push(skill)
        var newIntent=''
        if (intent && intent.trim().length > 0) newIntent = intent
        saveItem({id:null, example:'', intent:intent, skills:skills,tags:[]})
   }
    
    function saveItemWrap(item,index) {
        saveItem(item,index)
        listRef.current.resetAfterIndex(index);
        updateLookups(items)
    }
    
    function getItemSize(index) {
        //console.log(window.innerWidth,window.innerHeight)
        // set parameters for full size > 1024
        var baseSize = 100
        var heightPerLine = 70
        var tagsPerLine = 10
        var entitiesPerLine = 8
        var skillsPerLine = 6
        // tiny screen mobile 
        if (window.innerWidth < 430) {
            baseSize = 140
            heightPerLine = 50
            tagsPerLine = 4
            entitiesPerLine = 1
            skillsPerLine = 1
        // medium screen tablet
        } else if (window.innerWidth <= 768) {
            baseSize = 120
            heightPerLine = 30
            tagsPerLine = 2
            entitiesPerLine = 1
            skillsPerLine = 2
        }
        var tallyExtras = 0;
        var item = items[index]
        if (item && item.entities) tallyExtras += item.entities.length/entitiesPerLine;
        if (item && item.tags) tallyExtras += item.tags.length/tagsPerLine;
        if (item && item.skills) tallyExtras += item.skills.length/skillsPerLine;
        var size = baseSize + (Math.round(tallyExtras)) * heightPerLine
        //console.log(['ITEM SIZE',size, baseSize,heightPerLine,tagsPerLine,entitiesPerLine,tallyExtras,item])
        return size 
    }
    
    function saveLSItem(item) {
        var localforageStorage = localforage.createInstance({
           name: 'nlutool',
           storeName   :'examples',
         });
         localforageStorage.getItem('alldata').then(function(exampleItems) {
                exampleItems.push(item)
                localforageStorage.setItem('alldata',exampleItems)
         })
       
    }
    
    function saveLSItems(newItems) {
        var localforageStorage = localforage.createInstance({
           name: 'nlutool',
           storeName   :'examples',
         });
         localforageStorage.getItem('alldata').then(function(exampleItems) {
                newItems.map(function(newItem) { exampleItems.push(newItem ); return null})
                localforageStorage.setItem('alldata',exampleItems)
         })
       
    }

     
    function saveNlu(splitNumber) {
        if (items && items[splitNumber]) {
            //props.saveNluItem(items[splitNumber]) 
            saveLSItem(items[splitNumber])
            deleteItem(splitNumber)
        }
    }
    
      function untagAll(val) {
        console.log(['untagall',tagAllValue,val])
        //var tagValue = val ? val : tagAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
                
               if (item.isSelected && item.id && filteredItemsKeys[item.id]) {
                   var newItem = JSON.parse(JSON.stringify(item));
                   if (!newItem.tags) newItem.tags=[]
                   var finalTags = []
                   newItem.tags.map(function(tag) {
                       if (tag != val) {
                           finalTags.push(tag)
                       }  
                       return null
                   })
                   newItem.tags = finalTags
                   newItems.push(newItem)
               } else {
                   newItems.push(item)
               }  
               return null
            })
            setItems(newItems)
        }
    }
    
       function unskillAll(val) {
        console.log(['unskillall',tagAllValue,val])
        //var tagValue = val ? val : tagAllValue;
        if (items) {
            var newItems = []
            items.map(function(item,i) {
                
               if (item.isSelected && item.id && filteredItemsKeys[item.id]) {
                   var newItem = JSON.parse(JSON.stringify(item));
                   if (!newItem.skills) newItem.skills=[]
                   var finalTags = []
                   newItem.skills.map(function(tag) {
                       if (tag != val) {
                           finalTags.push(tag)
                       }  
                       return null
                   })
                   newItem.skills = finalTags
                   newItems.push(newItem)
               } else {
                   newItems.push(item)
               }  
               return null
            })
            setItems(newItems)
        }
    }
    
    function sortItems() {
        
    }
    

    
    return {
        loadAll, saveItem, deleteItem , items, setItems, findKeyBy, filter, filteredItems, setFilteredItems,createEmptyItem, 
        searchFilter, setSearchFilter, tagAllValue, setTagAllValue, skillAllValue, setSkillAllValue, skillFilterValue, setSkillFilterValue,intentFilterValue, setIntentFilterValue,
         intentAllValue, setIntentAllValue, listRef, 
        tagAll,untagAll, unskillAll, intentAll, resetSelection, selectAll,  skillSetAll, saveItemWrap, getItemSize, deleteAll, saveAll, saveNlu
    }
}
export default useNluEditor