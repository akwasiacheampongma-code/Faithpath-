import { Image, View } from "react-native";
import { a51Stage, treeLayout } from "./a51/stages";
import { NATIVE_GROUPS, nativeSource } from "./a51/native-assets";
export function TreeStill({stage:index,size=100}:{stage:number;size?:number}) {
  const stage=a51Stage(index),frame=treeLayout(stage,size),full=NATIVE_GROUPS.find(g=>g.stage===stage.index&&g.resolution===640)!.full;
  return <View accessible={false} style={{width:size,height:size,justifyContent:"flex-end"}}>
    <View style={{width:size,height:frame.height}}>
      <Image accessible={false} source={nativeSource(full.file)} resizeMode="stretch" style={{position:"absolute",width:full.width/640*frame.artWidth,height:full.height/640*frame.artWidth,left:frame.left+full.x/640*frame.artWidth,bottom:frame.bottom+(640-full.y-full.height)/640*frame.artWidth}} />
    </View>
  </View>;
}
