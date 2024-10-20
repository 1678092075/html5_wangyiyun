<template>
  <div id="swiperTop">
    <van-swipe :autoplay="3000">
      <!-- 渲染轮播图的每一张图片 -->
      <van-swipe-item v-for="(image, index) in state.images" :key="index">
        <!-- 处理图片加载失败时显示占位符 -->
        <img 
          :src="image" 
          @error="onImageError(index)" 
          @load="onImageLoad" 
        />
      </van-swipe-item>
    </van-swipe>

    <!-- 如果正在加载，显示加载指示器 -->
    <div v-if="state.loading" class="loading-indicator">
      加载中...
    </div>
  </div>  
</template>

<script>
import axios from 'axios';
import { reactive, onMounted } from 'vue';

export default {
  setup() {
    const state = reactive({
      images: [],  // 保存获取到的图片 URL
      loading: true // 表示图片加载的状态
    });

    // 定义获取图片的函数
    const fetchImage = () => {
      axios.get(`https://api.paugram.com/wallpaper/?source=sm&t=${new Date().getTime()}`, {
        responseType: 'blob',
        timeout: 5000  // 设置5秒超时时间
      })
      .then((res) => {
        // 将 blob 数据转换为可用的 URL
        const imageUrl = URL.createObjectURL(res.data);
        state.images.push(imageUrl);
        console.log('Image added:', imageUrl);
      })
      .catch((error) => {
        console.error('Error fetching image:', error);
      });
    };

    // 图片加载失败时，显示占位符图片
    const onImageError = (index) => {
      console.error(`Image at index ${index} failed to load.`);
      state.images[index] = 'https://via.placeholder.com/300x200';  // 使用占位符图片
    };

    // 图片加载完成后取消 loading 状态
    const onImageLoad = () => {
      state.loading = false;
    };

    // 初始调用：组件挂载后第一次获取图片
    onMounted(() => {
      fetchImage();

      // 每隔5秒调用一次 API 继续获取新图片
      setInterval(() => {
        fetchImage();
      }, 5000);  // 5秒刷新一次轮播图图片
    });

    return { state, onImageError, onImageLoad };
  },
};
</script>

<style lang="less">
#swiperTop{
  .van-swipe{
    width: 100%;
    height: 3rem;
    .van-swipe-item{
      padding: 0 0.2rem;
      img{
        width: 100%;
        height: 100%;
        border-radius: 0.2rem;
      }
    }
    .van-swipe__indicator--active{
      background-color: rgb(219,130,130);
    }      
  }

  .loading-indicator {
    text-align: center;
    margin-top: 1rem;
    color: #999;
  }
}
</style>
