import { Image, View } from "react-native";
import { a51Stage, stageVariant, treeLayout } from "./a51/stages";
import { sourceFor } from "./a51/assets";
export function TreeStill({stage: index,size=100}:{stage:number;size?:number}) {
  const stage = a51Stage(index), frame = treeLayout(stage,size);
  return <View accessible={false} style={{width:size,height:size,justifyContent:"flex-end"}}>
    <View style={{width:size,height:frame.height}}>
      <Image accessible={false} source={sourceFor(stageVariant(stage,size,2))} resizeMode="contain" style={{position:"absolute",width:frame.artWidth,height:frame.artWidth,left:frame.left,bottom:frame.bottom}} />
    </View>
  </View>;
}
