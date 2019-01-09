---
layout: post
title: "闲话WinFrom与WPF(3)"
subtitle: "控件篇——CheckedListBox"
description: "本篇主要介绍CheckedListBox控件的全选实现，由于WPF中没有CheckedListBox控件，所以这里自己简单实现一个CheckedListBox控件。鉴于此Demo为本系列文章的第一篇WPFDemo，这里着重讲述了WPF开发中重写模板的一些问题"
sourcecode: https://github.com/NanQi/demo/tree/master/SelectDemo
category: demo
tags: [C#, WPF, 闲话WinFrom与WPF]
cover: cover/framework.jpg
---

我曾经写过一个[筛选的Demo](http://nanqi.info/blog/2012/12/05/filter/)，里面有一个列表选择控件：

![列表选择]\(http://img.youyag.com/blog/image/filter/filter.png)

这次只是说一个全选功能。  
我曾经以为应该有更优雅的方式去实现全选功能，即使到现在我还是没有找到，有时候人们会告诉你不要对一个问题过于纠结，只要实现了功能就成，但是程序员往往不是这么想。  
当我开始再一次用WinForm实现这个功能时，发现还是只能使用原来的方法，没有更好的方案去做这个。这要说还是由于WinForm过于死板，无法如WPF一般简单的实现自定义。  
鉴于此Demo为本系列文章的第一篇WPF的Demo，这里尽量说的自己感觉易懂，仅仅展示重写模板的一些问题。  

##WinForm中的实现方案

---

代码几乎与那个筛选的Demo没有改变多少，唯一不同的是我发现其实不必自己去控制CheckedBox的选择（AutoCheck），同时也发现其实自己当时做的也没有错，因为如果当CheckedBox的CheckState属性为indeterminate时，想让再点一次让其选中，那么还必须我这么做（其实也从侧面反应，自己不止实现多余，而且做错了）。  
我依旧使用CheckedListBox的ItemCheck事件，代码如下：

    private void chbxList_ItemCheck(object sender, ItemCheckEventArgs e)
    {
        this.chbxAll.CheckedChanged -= this.chbxAll_CheckedChanged;
    
        if (e.NewValue == CheckState.Checked && chbxList.CheckedItems.Count + 1 >= chbxList.Items.Count)
        {
            chbxAll.CheckState = CheckState.Checked;
        }
        else if (e.NewValue == CheckState.Unchecked && chbxList.CheckedItems.Count - 1 <= 0)
        {
            chbxAll.CheckState = CheckState.Unchecked;
        }
        else
        {
            chbxAll.CheckState = CheckState.Indeterminate;
        }
    
        this.chbxAll.CheckedChanged += this.chbxAll_CheckedChanged;
    }

我一直耿耿于怀的是-=和+=的问题，这次我突然想起，当初为什么要使用ItemCheck事件，而不是SelectedIndexChanged，这次试了试，本以为又发现了原来代码中可以优化的地方，最后还是知道当初为什么不用。  
和我当年使用DataGridView时在上面增加一个CheckBox列同样的问题：双击会出问题。  
有兴趣的同学可以试试，我这里就不再演示了，类似的问题其实还有很多，涉及WinForm与WPF，但是往往都是，WPF中发现问题，可以很容易的使用其他方法解决，但是WinForm中解决起来就不是那么容易了。  

##WPF中实现一个CheckedListBox

---

WPF中是没有这么一个控件的，但是几乎使用过几次WPF的人，都能实现这么一个控件，说控件就成了WinForm中的方式，这里可能仅仅换个样式就可以实现。  
WPF中的xaml，我到现在仍有许多问题没有弄懂，我深切的知道一个刚接触WPF的人，看到一大堆xaml那种恐惧的心情，而且这也是本系列文章第一次使用WPF，我想还是有必要说一些基本的问题（但不是基础）。  
首先当你拿到源码，你会发现我使用ListBox实现，这个选择很多，这里不必纠结于此，你又会发现我将这个样式写了两份，而且一个存放在一个ResourceDictionary中，在App.xaml中引入了它。  
要说其实这种方式与带Key值的差不多，但是还有不少区别，如果把这个例子放在一个项目中，那么没有带Key值显然是错的，因为不可能让所有ListBox都成为一个CheckedListBox，但是我是很讨厌在一个控件上看到很多属性的，至少当它放在界面上的时候，能少则少，至少本例中没有任何问题。我最后放在界面上会是这样：

    <ListBox Name="checkListBox"
             Canvas.Left="10"
             Canvas.Top="29"
             Width="256"
             Height="191"
             ItemsSource="{StaticResource ItemsData}"
             SelectionChanged="checkListBox_SelectionChanged"
             SelectionMode="Multiple" />
        
接下来说说为什么我把样式写了两份，首先看看第一个样式：

    <Style TargetType="{x:Type ListBoxItem}">
        <Setter Property="Template">
            <Setter.Value>
                <ControlTemplate TargetType="{x:Type ListBoxItem}">
                    <CheckBox Margin="{TemplateBinding Margin}"
                              Content="{TemplateBinding Content}"
                              ContentTemplate="{TemplateBinding ContentTemplate}"
                              ContentTemplateSelector="{TemplateBinding ContentTemplateSelector}"
                              FocusVisualStyle="{TemplateBinding FocusVisualStyle}"
                              IsChecked="{Binding IsSelected,
                                                  RelativeSource={RelativeSource TemplatedParent}}" />
                </ControlTemplate>
            </Setter.Value>
        </Setter>
    </Style>

如果你觉得这份代码很简单，那么可能你WPF所知甚多，也可能你和原来的我一样，完全不懂得为什么使用TemplateBinding。  
WPF的过于灵活，会让一个功能的实现有千万种写法，很多时候，当你发现一个样式怎么都对不上的时候，往往问题已经很难解决。  
使用TemplateBinding无非有两种情况（自我总结）：

1. 普通绑定
2. 不在模板中写死，给外面留下扩展

关于第一点这里就不说了，如上面的Content，如果这里没有这句绑定，那么你会发现只有一个复选框，而没有文字。  
关于第二点，这里有个复用的问题，写在模板中，不管外界设置什么，模板中的值都是不会改变的。这就无形中将一个功能彻底定死，如果没有绝对的原因，请千万别这么做，为说明，这里展示第二个样式：

    <Style TargetType="{x:Type ListBox}">
        <Setter Property="ItemContainerStyle">
            <Setter.Value>
                <Style BasedOn="{StaticResource {x:Type ListBoxItem}}" TargetType="{x:Type ListBoxItem}">
                    <Setter Property="Margin" Value="2,2,0,0" />
                </Style>
            </Setter.Value>
        </Setter>
    </Style>

第二个样式主要的功能其实就是设置ListBoxItem的Margin属性，但是为什么当初没有把这个值直接写在第一个样式中。  
这时候有人会说，我可以在外面再重写模板一样可以实现，是的，一样可以，但是为什么要偏偏这么说呢，孰优孰劣，一眼便知。  

##WPF中的实现方案

---

这只是为了做对比，使用完全WinForm的事件驱动方式完成。  
WPF中当然不必如此，我会在下一节中使用WPF的方式去逐步实现这个功能，这里先看看如我这等从WinForm迁移倒WPF中首先出现的问题，找事件。  
所辛的是，这个例子中都能找到相应的事件，如果换做别的功能，你可能会发现，很多WinForm中有的事件，在WPF中却没有，当问题曝露出来的时候，你应该考虑系统的学学WPF中的实现方式，而不是按照自己的方式继续去实现。  
咱们先看看在WPF中直接使用WinForm的思路去做。  

    private void checkListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        chbxAll.IsChecked = checkListBox.SelectedItems.Count == 0 ? false :
                checkListBox.SelectedItems.Count == checkListBox.Items.Count ? (bool?)true : null;
    }
    
    private void chbxAll_Checked(object sender, RoutedEventArgs e)
    {
        checkListBox.SelectAll();
    }
    
    private void chbxAll_Unchecked(object sender, RoutedEventArgs e)
    {
        checkListBox.UnselectAll();
    }

你会发现，似乎很简单，比WinForm中还要简单。  
但是你可知道，WPF如果要做到真正的页面与逻辑分离，后台是没有任何逻辑代码的，要有，也仅仅是一些控制界面的显示的代码。  
当然，我们不需要把一件事情做的太彻底，而且强求不在后台写代码也不是一种正确的开发方式，而例子写在这里，也仅仅只想表达一个意思，那就是在WPF中一个功能的实现方式太多，希望大家不要因为实现了而不再去探索更好的实现方式，有时候这也是对于WPF设计方面的一次学习。  

